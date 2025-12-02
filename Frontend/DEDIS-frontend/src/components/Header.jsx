import { useLocation } from 'preact-iso';
import { useState, useEffect } from 'preact/hooks';

export function Header() {
	const { url } = useLocation();
	const [token, setToken] = useState(localStorage.getItem('token'));

	// Keep token in sync if it changes in other tabs
	useEffect(() => {
		const handleStorage = () => setToken(localStorage.getItem('token'));
		window.addEventListener('storage', handleStorage);
		return () => window.removeEventListener('storage', handleStorage);
	}, []);

	function logout() {
		localStorage.removeItem('token');
		setToken(null);
	}

	return (
		<header>
			<nav>
				<a href="/" class={url == '/' && 'active'}>Home</a>



				{/* Show Login/Register if not logged in */}
				{!token && (
					<>
						<a href="/login" class={url == '/login' && 'active'}>Log in</a>
						<a href="/register" class={url == '/register' && 'active'}>Register</a>
						
					</>
				)}

				{/* Show Profile and Logout if logged in */}
				{token && (
					<>
						<a href="/profile" class={url == '/profile' && 'active'}>Profile</a>
						<a href="/stock" class={url == '/stock' && 'active'}>Stock</a>
						<button onClick={logout} style={{ marginLeft: '1rem' }}>Logout</button>
					</>
				)}
			</nav>
		</header>
	);
}
