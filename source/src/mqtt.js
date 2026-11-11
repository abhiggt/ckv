/* =====================================================================
   ROOMS · A TINY MQTT CLIENT (MQTT 3.1.1 over secure WebSocket, QoS 0)
   Rooms go through public relay brokers instead of phone-to-phone links,
   so they work on any network and in any browser. Several brokers are tried at once.
   ===================================================================== */
const BROKERS = (() => {
  const m = /[?&]broker=([^&]+)/.exec(location.search);
  if (m) return [decodeURIComponent(m[1])];
  return ['wss://broker.emqx.io:8084/mqtt', 'wss://broker.hivemq.com:8884/mqtt', 'wss://test.mosquitto.org:8081/mqtt'];
})();
const enc = new TextEncoder(), dec = new TextDecoder();
function mqStr(s){ const b = enc.encode(s); return [b.length >> 8, b.length & 255, ...b]; }
function mqLen(n){ const o = []; do { let d = n % 128; n = Math.floor(n / 128); if (n > 0) d |= 128; o.push(d); } while (n > 0); return o; }
function mqPacket(head, body){ return new Uint8Array([head, ...mqLen(body.length), ...body]); }
class MQ {
  constructor(url){ this.url = url; this.ws = null; this.ok = false; this.pid = 1; this.buf = new Uint8Array(0); this.onmsg = null; this.onclose = null; this.ping = 0; }
  connect(clientId, will, timeout){
    return new Promise((resolve, reject) => {
      let done = false; const fail = e => { if (!done){ done = true; try { this.ws && this.ws.close(); } catch(_){} reject(e); } };
      let ws; try { ws = this.ws = new WebSocket(this.url, ['mqtt']); } catch(e){ return fail(e); }
      ws.binaryType = 'arraybuffer';
      const timer = setTimeout(() => fail(new Error('timeout')), timeout || 7000);
      ws.onopen = () => {
        const flags = 0x02 | (will ? 0x04 : 0);
        const body = [...mqStr('MQTT'), 4, flags, 0, 30, ...mqStr(clientId)];
        if (will) body.push(...mqStr(will.topic), ...mqStr(will.msg));
        ws.send(mqPacket(0x10, body));
      };
      ws.onerror = () => fail(new Error('socket'));
      ws.onclose = () => { clearInterval(this.ping); const was = this.ok; this.ok = false; if (!done){ clearTimeout(timer); fail(new Error('closed')); } else if (was && this.onclose) this.onclose(); };
      ws.onmessage = ev => {
        const add = new Uint8Array(ev.data), b = new Uint8Array(this.buf.length + add.length); b.set(this.buf); b.set(add, this.buf.length); this.buf = b;
        for (;;){
          if (this.buf.length < 2) break;
          let len = 0, mul = 1, i = 1, byte;
          do { if (i >= this.buf.length) return; byte = this.buf[i++]; len += (byte & 127) * mul; mul *= 128; } while (byte & 128);
          if (this.buf.length < i + len) break;
          const type = this.buf[0] >> 4, flags = this.buf[0] & 15, p = this.buf.subarray(i, i + len);
          this.buf = this.buf.slice(i + len);
          if (type === 2){ clearTimeout(timer); if (p[1] === 0){ done = true; this.ok = true; this.ping = setInterval(() => this.raw(new Uint8Array([0xC0, 0])), 20000); resolve(this); } else fail(new Error('refused ' + p[1])); }
          else if (type === 3){ const tl = (p[0] << 8) | p[1], topic = dec.decode(p.subarray(2, 2 + tl)); let off = 2 + tl; if ((flags >> 1) & 3) off += 2; if (this.onmsg) this.onmsg(topic, dec.decode(p.subarray(off))); }
        }
      };
    });
  }
  raw(u8){ try { if (this.ws && this.ws.readyState === 1) this.ws.send(u8); } catch(e){} }
  sub(topic){ const id = this.pid++ & 0xffff || 1; this.raw(mqPacket(0x82, [id >> 8, id & 255, ...mqStr(topic), 0])); }
  pub(topic, msg){ this.raw(mqPacket(0x30, [...mqStr(topic), ...enc.encode(msg)])); }
  close(){ clearInterval(this.ping); this.ok = false; this.onclose = null; try { this.raw(new Uint8Array([0xE0, 0])); this.ws && this.ws.close(); } catch(e){} }
}
