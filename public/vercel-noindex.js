if (location.hostname.endsWith('vercel.app')) {
  var robots = document.createElement('meta');
  robots.name = 'robots';
  robots.content = 'noindex, nofollow';
  document.head.appendChild(robots);
}
