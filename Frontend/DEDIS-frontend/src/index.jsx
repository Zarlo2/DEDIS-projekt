import { LocationProvider, Router, Route, hydrate, prerender as ssr } from 'preact-iso';

import { Header } from './components/Header.jsx';
import { Home } from './pages/Home/index.jsx';
import { NotFound } from './pages/_404.jsx';
import { Stock } from './pages/Stock.jsx';

// NEW AUTH PAGES
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { Profile } from './pages/Profile.jsx';

import './style.css';

export function App() {
	return (
		<LocationProvider>
			<Header />
			<main>
				<Router>
					<Route path="/" component={Home} />

					{/* NEW ROUTES */}
					<Route path="/login" component={Login} />
					<Route path="/register" component={Register} />
					<Route path="/profile" component={Profile} />

					<Route path="/stock" component={Stock} />
					<Route default component={NotFound} />
				</Router>
			</main>
		</LocationProvider>
	);
}

if (typeof window !== 'undefined') {
	hydrate(<App />, document.getElementById('app'));
}

export async function prerender(data) {
	return await ssr(<App {...data} />);
}
