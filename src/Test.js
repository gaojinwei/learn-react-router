import React from "react";

let instances = [];

const register = comp => instances.push(comp);
const unregister = comp => instances.splice(instances.indexOf(comp), 1);

const historyPush = path => {
  console.log("push");
  window.history.pushState({}, null, path);
  instances.forEach(instance => instance.forceUpdate());
};

const historyReplace = path => {
  window.history.replaceState({}, null, path);
  instances.forEach(instance => instance.forceUpdate());
};

const matchPath = (pathname, options) => {
  const exact = options.exact || false;
  const path = options.path;

  if (!path) {
    return {
      path: null,
      url: pathname,
      isExact: true
    };
  }

  //url是否匹配定义的path，返回数组或null
  const match = new RegExp(`^${path}`).exec(pathname);

  if (!match) return null;

  const url = match[0];
  const isExact = pathname === url;

  //如果要求精准匹配但不是则认为不匹配
  if (exact && !isExact) return null;

  return {
    path,
    url,
    isExact
  };
};

class Route extends React.Component {
  componentWillMount() {
    window.addEventListener("popstate", this.handlePop);
    register(this);
  }

  componentWillUnmount() {
    unregister(this);
    window.removeEventListener("popstate", this.handlePop);
  }

  handlePop() {
    console.log("popstate");
    this.forceUpdate();
  }

  render() {
    const { path, exact, component, render } = this.props;

    const match = matchPath(window.location.pathname, {
      path,
      exact
    });

    if (!match) return null;

    if (component)
      return React.createElement(component, {
        match
      });

    if (render)
      return render({
        match
      });

    return null;
  }
}

class Link extends React.Component {
  handleClick(event) {
    const { replace, to } = this.props;

    event.preventDefault();
    replace ? historyReplace(to) : historyPush(to);
  }

  render() {
    const { to, children } = this.props;

    return (
      <a href={to} onClick={this.handleClick}>
        {children}
      </a>
    );
  }
}

class Redirect extends React.Component {
  componentDidMount() {
    const { to, push } = this.props;

    push ? historyPush(to) : historyReplace(to);
  }
  render() {
    return null;
  }
}

// Implementation

const Home = () => <h2>Home</h2>;

const About = () => <h2>About</h2>;

const Topic = ({ topicId }) => <h3>{topicId}</h3>;

const Topics = ({ match }) => {
  const items = [
    {
      name: "Rendering with React",
      slug: "rendering"
    },
    {
      name: "Components",
      slug: "components"
    },
    {
      name: "Props v. State",
      slug: "props-v-state"
    }
  ];

  return (
    <div>
      <h2>Topics</h2>
      <ul>
        {items.map(({ name, slug }) => (
          <li key={name}>
            <Link to={`${match.url}/${slug}`}>{name}</Link>
          </li>
        ))}
      </ul>
      {items.map(({ name, slug }) => (
        <Route
          key={name}
          path={`${match.path}/${slug}`}
          render={() => <Topic topicId={name} />}
        />
      ))}
      <Route
        exact
        path={match.url}
        render={() => <h3>Please select a topic.</h3>}
      />
    </div>
  );
};

const App = () => {
  return (
    <div>
      <Route
        render={props => {
          return <pre>URL: {JSON.stringify(props.match.url)}</pre>;
        }}
      />

      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/topics">Topics</Link>
        </li>
      </ul>

      <hr />

      <Route exact path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/topics" component={Topics} />
    </div>
  );
};

export default App;

//ReactDOM.render(<App />, document.getElementById("app"));
