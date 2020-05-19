const win: any = window;
const doc = document;
const UA = win.navigator.userAgent;
const evtMap = {};
const isAndroid =
  UA.indexOf('Android') > -1 ||
  UA.indexOf('android') > -1 ||
  UA.indexOf('Adr') > -1;
let iframeNode: HTMLIFrameElement;
let bridge: Bridge;

const event = {
  trigger(name: string, args?: any) {
    const cbs = evtMap[name];

    if (cbs) {
      cbs.forEach(fn => fn.apply(fn, [].concat(args)));
    }
  },
  on(name: string, cb: (data?: any) => any) {
    if (!evtMap[name]) {
      evtMap[name] = [cb];
    } else if (evtMap[name].indexOf(cb) < 0) {
      // 根据 cb 引用排重
      evtMap[name].push(cb);
    }
  }
};

interface Response {
  errCode: string;
  data?: any;
  errDescription?: string;
}

type BridgeCallback = (rep: Response, cb: any) => void;

interface Bridge {
  registerHandler: (api: string, cb: BridgeCallback) => void;
  callHandler: (api: string, data: object, cb: BridgeCallback) => void;
}

function isFunc(fn) {
  return typeof fn === 'function';
}

function createIframeRquest(url: string) {
  if (!iframeNode) {
    iframeNode = doc.createElement('iframe');
    iframeNode.style.display = 'none';
    doc.documentElement.appendChild(iframeNode);
  }

  // 不删除iframe，留作复用
  iframeNode.src = url;
}

function androidSetup() {
  return new Promise(resolve => {
    doc.addEventListener(
      'WebViewJavascriptBridgeReady',
      () => {
        resolve(win.WebViewJavascriptBridge);
      },
      false
    );
  });
}

function iOSSetup() {
  return new Promise(resolve => {
    if (win.WVJBCallbacks) {
      win.WVJBCallbacks.push(resolve);
    } else {
      win.WVJBCallbacks = [resolve];
      createIframeRquest('https://__bridge_loaded__');
    }
  });
}

function connect() {
  const WVJB = win.WebViewJavascriptBridge;

  // 检查是否已经被初始化过
  if (WVJB) {
    return Promise.resolve(WVJB);
  } else {
    return isAndroid ? androidSetup() : iOSSetup();
  }
}

function parseResponse(response: Response = { errCode: '0' }): Response {
  try {
    if (typeof response === 'string') {
      response = JSON.parse(response);
    }
    if (typeof response === 'string') {
      response = JSON.parse(response);
    }
    if (typeof response.data === 'string') {
      response.data = JSON.parse(response.data);
    }
    if (typeof response.data === 'string') {
      response.data = JSON.parse(response.data);
    }
    if (typeof response.data === 'object') {
      if (typeof response.data.data === 'string') {
        response.data.data = JSON.parse(response.data.data);
      }
      if (typeof response.data.data === 'string') {
        response.data.data = JSON.parse(response.data.data);
      }
    }
  } catch (e) {
    console.warn('Api response parsing failed', e, response);
  }

  return response;
}

function invoke(api, data) {
  console.log(`[CARD LOADER] Invoking ${api}`, data);

  return new Promise((resolve, reject) => {
    bridge.callHandler(api, data, (response: Response) => {
      console.log(`[CARD LOADER] Response ${api}`, response);
      const rep = parseResponse(response);

      if (rep.errCode == '0') {
        resolve(rep.data);
      } else {
        reject(rep.errDescription);
      }
    });
  });
}

function listen(api: string) {
  const eventName = api.split('.')[2];
  const SNC = win.__SNC__;

  if (SNC) {
    return SNC.instance.on('ready', rep => {
      event.trigger(eventName, rep.data);
    });
  }

  bridge.registerHandler(api, (response: Response, cb) => {
    const rep = parseResponse(response);

    if (eventName === 'ready') {
      try {
        // 安卓需要二次解析 message
        rep.data.message = JSON.parse(rep.data.message);
      } catch (e) {}
    }

    event.trigger(eventName, rep.data);
  });
}

function bootstrap() {
  return connect().then(WVJB => {
    bridge = WVJB;

    // 等待 bridge 建立完毕，再监听事件
    // 同时能利用时间差保证 __SNC__ （如果有引入）挂载完成
    listen('hb.core.ready');
  });
}

const bootPromise = bootstrap();

function defMethod(api: string, defData?: object) {
  return (data = {}) => {
    const param = Object.assign({}, defData, data);

    if (!bridge) {
      return bootPromise.then(() => invoke(api, param));
    }

    return invoke(api, param);
  };
}

function addListener(name: string) {
  return handle => event.on(name, handle);
}

export const ready = addListener('ready');
export const onRendered = defMethod('hb.core.onRendered');
export const closeWindow = () => {
  defMethod('hb.bee.closeWindow')();
};
export const showWVModal = defMethod('hb.core.showWVModal', {
  path: '',
  display: {
    backgroundColor: '#000000',
    opacity: 0
  }
});
