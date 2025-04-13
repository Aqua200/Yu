import _0x36ae01 from 'axios';
const {
  generateWAMessageContent,
  generateWAMessageFromContent,
  proto
} = (await import("@whiskeysockets/baileys"))["default"];

let handler = async (_0x10bd40, {
  conn: _0x9c7141,
  text: _0x27db11,
  usedPrefix: _0x55e61b,
  command: _0x5ad406
}) => {
  if (!_0x27db11) {
    return _0x9c7141.reply(_0x10bd40.chat, "Ingrese el nombre de lo que desee buscar", _0x10bd40);
  }

  async function _0x3f3fc7(_0x5f4723) {
    const {
      imageMessage: _0x14a396
    } = await generateWAMessageContent({
      'image': {
        'url': _0x5f4723
      }
    }, {
      'upload': _0x9c7141.waUploadToServer
    });
    return _0x14a396;
  }

  function _0x2af019(_0x27693a) {
    for (let _0x5ce07a = _0x27693a.length - 1; _0x5ce07a > 0; _0x5ce07a--) {
      const _0x4d6146 = Math.floor(Math.random() * (_0x5ce07a + 1));
      [_0x27693a[_0x5ce07a], _0x27693a[_0x4d6146]] = [_0x27693a[_0x4d6146], _0x27693a[_0x5ce07a]];
    }
  }

  let _0x51323f = [];
  try {
    // Nueva solución con encabezados y endpoint alternativo
    const _0x4fc489 = await _0x36ae01.get(`https://api.pinterest.com/v3/search/pins/?query=${encodeURIComponent(_0x27db11)}&count=10`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.pinterest.com/',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!_0x4fc489.data || !_0x4fc489.data.pins) {
      return _0x9c7141.reply(_0x10bd40.chat, "No se encontraron resultados", _0x10bd40);
    }

    let _0x5f34cb = _0x4fc489.data.pins.map(_0x33ba1c => _0x33ba1c.image.original.url);
    _0x2af019(_0x5f34cb);
    let _0x3b2637 = _0x5f34cb.slice(0, 5);
    let _0x2913ed = 1;

    for (let _0x47c48a of _0x3b2637) {
      try {
        _0x51323f.push({
          'body': proto.Message.InteractiveMessage.Body.fromObject({
            'text': "Imagen -" + (" " + _0x2913ed++)
          }),
          'footer': proto.Message.InteractiveMessage.Footer.fromObject({
            'text': "Pinterest Search"
          }),
          'header': proto.Message.InteractiveMessage.Header.fromObject({
            'title': '',
            'hasMediaAttachment': true,
            'imageMessage': await _0x3f3fc7(_0x47c48a)
          }),
          'nativeFlowMessage': proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
            'buttons': [{
              'name': "cta_url",
              'buttonParamsJson': JSON.stringify({
                "display_text": "Ver en Pinterest",
                "url": `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(_0x27db11)}`
              })
            }]
          })
        });
      } catch (e) {
        console.error("Error procesando imagen:", e);
      }
    }

    const _0x1ca5c6 = generateWAMessageFromContent(_0x10bd40.chat, {
      'viewOnceMessage': {
        'message': {
          'messageContextInfo': {
            'deviceListMetadata': {},
            'deviceListMetadataVersion': 2
          },
          'interactiveMessage': proto.Message.InteractiveMessage.fromObject({
            'body': proto.Message.InteractiveMessage.Body.create({
              'text': "Resultado de: " + _0x27db11
            }),
            'footer': proto.Message.InteractiveMessage.Footer.create({
              'text': "Pinterest - Search"
            }),
            'header': proto.Message.InteractiveMessage.Header.create({
              'hasMediaAttachment': false
            }),
            'carouselMessage': proto.Message.InteractiveMessage.CarouselMessage.fromObject({
              'cards': [..._0x51323f]
            })
          })
        }
      }
    }, {
      'quoted': _0x10bd40
    });

    await _0x10bd40.react("✅");
    await _0x9c7141.relayMessage(_0x10bd40.chat, _0x1ca5c6.message, {
      'messageId': _0x1ca5c6.key.id
    });

  } catch (error) {
    console.error("Error en Pinterest search:", error);
    await _0x10bd40.react("❌");
    await _0x9c7141.reply(_0x10bd40.chat, "Ocurrió un error al buscar en Pinterest. Intenta nuevamente más tarde.", _0x10bd40);
  }
};

handler.help = ["pinterest"];
handler.tags = ["buscador"];
handler.estrellas = 1;
handler.register = true;
handler.command = ['pinterest'];
export default handler;
