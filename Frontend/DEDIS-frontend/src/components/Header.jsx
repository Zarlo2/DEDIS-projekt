import { useLocation } from 'preact-iso';

export function Header() {
	const { url } = useLocation();

	return (
		<header>
			<nav>
				<a href="/" class={url == '/' && 'active'}>
					Home
				</a>
				<a href="/404" class={url == '/404' && 'active'}>
					404test
				</a>
				<a href="/stock" class={url == '/stock' && 'active'}>
					Stock
				</a>
			</nav>
		</header>
	);
}
