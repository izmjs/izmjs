$(function onLoad() {
  const wmks = WMKS.createWMKS('wmksContainer', {
    allowMobileKeyboardInput: false,
    fitToParent: true,
  }).register(WMKS.CONST.Events.CONNECTION_STATE_CHANGE, function (event, data) {
    switch (data.state) {
      case WMKS.CONST.ConnectionState.CONNECTED:
        console.log('connection state change : connected');
        break;
      case WMKS.CONST.ConnectionState.CONNECTING:
        break;
    }
  });
  const __ticket__ = {};
  const url = `wss://${__ticket__.host}/${__ticket__.port};${__ticket__.ticket}`;
  wmks.setOption('VCDProxyHandshakeVmxPath', __ticket__.vmx);
  wmks.connect(url);
});
