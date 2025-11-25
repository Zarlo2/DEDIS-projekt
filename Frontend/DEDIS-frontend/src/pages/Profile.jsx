import { useEffect, useState } from 'preact/hooks';


export function Profile() {
const [user, setUser] = useState(null);
const [msg, setMsg] = useState('Loading...');


useEffect(() => {
async function load() {
const token = localStorage.getItem('token');
if (!token) return setMsg('Not logged in');


try {
const res = await fetch('/api/profile', {
headers: { Authorization: `Bearer ${token}` }
});
const data = await res.json();


if (!res.ok) return setMsg(data.error || 'Failed');
setUser(data.user);
setMsg('');
} catch {
setMsg('Network error');
}
}
load();
}, []);


if (msg) return <p style="padding:2rem;">{msg}</p>;


return (
<div style="padding:2rem;">
<h1>Profile</h1>
<p>Email: {user.email}</p>
</div>
);
}