import { useState } from 'preact/hooks';

export function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [msg, setMsg] = useState('');

	async function submit(e) {
		e.preventDefault();
		setMsg('');

		try {
			const res = await fetch('/api/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password })
			});
			const data = await res.json();

			if (!res.ok) return setMsg(data.error || 'Login failed');

			// Store token
			localStorage.setItem('token', data.token);
			setMsg('Logged in!');

			// Redirect to /home
			window.location.href = '/';
		} catch (err) {
			setMsg('Network error');
		}
	}

	return (
		<div style="padding:2rem; max-width:400px; margin:auto;">
			<h1>Login</h1>
			<form onSubmit={submit}>
				<input
				type="email"
				value={email}
				onInput={e => setEmail(e.target.value)}
				placeholder="Email"
					required
							/>
				<br /><br />
				<input
					value={password}
					onInput={e => setPassword(e.target.value)}
					type="password"
					placeholder="Password"
				/>
				<br /><br />
				<button>Login</button>
			</form>
			<p>{msg}</p>
		</div>
	);
}
