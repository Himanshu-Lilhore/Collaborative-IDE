import './index.css'
import App from './App'
import Home from './components/Home/Home'
import Profile from './components/User/Profile'
import Login from './components/User/Login'
import Register from './components/User/Register'
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import ReactDOM from "react-dom/client";
import { Provider } from 'react-redux'
import {store} from './app/store'
import Projects from './components/Projects'
import Playground from './components/Playground'
import Session from './components/Session'

const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
		children: [
			{
				path: "/user/register",
				element: <Register />,
			},
			{
				path: "/user/login",
				element: <Login />,
			},
			{
				path: "/user/profile",
				element: <Profile />,
			},
			{
				path: "/user/profile-update",
				element: <Profile />,
			},
			{
				path: "/user/projects",
				element: <Projects />,
			},
			{
				path: "/home",
				element: <Home />,
			},
			{
				path: "/",
				element: <Home />,
			},
			{
				path: "/session",
				element: <Session />,
				children: [
					{
						path: "/session/:sessionId",
						element: <Playground />,
					},
				]
			},
		],
	}
])

ReactDOM.createRoot(document.getElementById("root")!).render(
	<Provider store={store}>
		<RouterProvider router={router} />
    </Provider>
);