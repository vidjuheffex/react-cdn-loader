import React from 'react';
import ReactDOM from 'react-dom';
import CDNLoader from '../src/cdn-loader';

const App = () => (
  <div>
    <CDNLoader
      deps={
          [
            {
              url: 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css',
            },
          ]
        }
    />
    <p>React here!</p>
  </div>
);
export default App;
ReactDOM.render(<App />, document.getElementById('app'));
