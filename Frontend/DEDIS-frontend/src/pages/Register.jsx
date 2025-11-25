import { useState } from 'preact/hooks';


export function Register() {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [msg, setMsg] = useState('');


async function submit(e) {
e.preventDefault();
setMsg('');


try {
const res = await fetch('/api/register', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ email, password })
});
const data = await res.json();


if (!res.ok) return setMsg(data.error || 'Registration failed');
setMsg('Registered successfully!');
} catch (err) {
setMsg('Network error');
}
}


return (
<div style="padding:2rem; max-width:400px; margin:auto;">
<h1>Register</h1>
<form onSubmit={submit}>
<input value={email} onInput={e=>setEmail(e.target.value)} placeholder="Email" /><br /><br />
<input value={password} onInput={e=>setPassword(e.target.value)} type="password" placeholder="Password" /><br /><br />
<button>Register</button>
</form>
<p>{msg}</p>
</div>
);
}