import { useState, useEffect } from "preact/hooks";


export function NotFound() {
  const [message, setMessage] = useState("Loading...");
  useEffect(() => {
fetch("/api/hello")
  .then(res => res.json())
  .then(data => setMessage(data.message))
  .catch(() => setMessage("Failed to connect to backend"));
  }, []);
	return (
		
		<section>
			<h1>{message}</h1>
			<p>It's gone :(</p>
		</section>
	);
}


