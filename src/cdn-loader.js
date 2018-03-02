import React, { Component } from 'react';
import PropTypes from 'prop-types';

function getID(index, href) {
  return `${index}_${href.replace(/[^\w]/g, '')}`;
}

function hasDependency(headArray, id) {
  let result;

  try {
    result = headArray.some(node => node.dataset.exDepID === id);
  } catch (err) {
    result = false;
  }

  return result;
}

export default class CDNLoader extends Component {
  static propTypes = {
    deps: PropTypes.arrayOf(
      PropTypes.shape(
        {
          url: PropTypes.string.isRequired,
          async: PropTypes.bool,
          integrity: PropTypes.string,
          crossOrigin: PropTypes.string,
        }
      )),
  }

  static defaultProps = {
    deps: [],
  }

  componentDidMount() {
    this.processDeps(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.deps !== nextProps.deps) {
      this.processDeps(nextProps);
    }
  }

  processDeps = (props) => {
    const { deps } = props;

    const cssDeps = [];
    const jsDeps = [];
    const jsAsyncDeps = [];

    deps.forEach((dep) => {
      if (dep.url.endsWith('.css')) {
        cssDeps.push(dep);
      } else if (dep.url.endsWith('.js') && !dep.async) {
        jsDeps.push(dep);
      } else if (dep.url.endsWith('js') && dep.async) {
        jsAsyncDeps.push(dep);
      }
    });

    this.processCssDeps(cssDeps);
    this.processJsDeps(jsDeps);
    this.processJsAsyncDeps(jsAsyncDeps);
  }

  processCssDeps = (cssDeps) => {
    const head = document.getElementsByTagName('head')[0];
    cssDeps.forEach((dep, index) => {
      const id = getID(index, dep.url);

      const hasDep = hasDependency(Array.from(head.childNodes), id)

      if (!hasDep) {
        const link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = dep.url;
        link.dataset.exDepID = id;
        head.appendChild(link);
      }
    });

    Array.from(head.childNodes).slice().reverse().forEach((node) => {
      try {
        if (node.dataset.exDepID && node.tagName === 'LINK') {
          if (cssDeps.findIndex(dep => dep.url === node.href) === -1) {
            head.removeChild(node);
          }
        }
      } catch (err) {
        
      }
    });
  }

  processJsDeps = (jsDeps) => {
    const head = document.getElementsByTagName('head')[0];
    jsDeps.forEach((dep, index) => {
      const id = getID(index, dep.url);

      const hasDep = hasDependency(Array.from(head.childNodes), id)

      if (!hasDep) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = dep.url;
        script.dataset.exDepID = id;
        head.appendChild(script);
      }
    });

    Array.from(head.childNodes).slice().reverse().forEach((node) => {
      try {
        if (node.dataset.exDepID && node.tagName === 'SCRIPT' && !node.async) {
          if (jsDeps.findIndex(dep => dep.url === node.src) === -1) {
            head.removeChild(node);
          }
        }
      } catch (err) {
        
      }
    });
  }

  processJsAsyncDeps = (jsAsyncDeps) => {
    const head = document.getElementsByTagName('head')[0];
    const promises = [];

    jsAsyncDeps.forEach((dep, index) => {
      const id = getID(index, dep.url);

      const hasDep = hasDependency(Array.from(head.childNodes), id)

      if (!hasDep) {
        promises.push(new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.type = 'text/javascript';
          script.async = true;
          script.onload = () => {
            resolve(true);
          };
          script.onerror = (err) => {
            reject(err);
          };
          script.src = dep.url;
          script.dataset.exDepID = id;
           head.appendChild(script);
        }));
      }

      if (promises.length) {
        Promise.all(promises).then(() => {
          events.onScriptsLoaded();
        });
      }
    });

    Array.from(head.childNodes).slice().reverse().forEach((node) => {
      try {
        if (node.dataset.exDepID && node.tagName === 'SCRIPT' && node.async) {
          if (jsAsyncDeps.findIndex(dep => dep.url === node.src) === -1) {
            head.removeChild(node);
          }
        }
      } catch (err) {
        
      }
    });
  }

  render() {
    return null;
  }
}
