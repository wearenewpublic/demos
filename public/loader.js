fetch('https://new-public-demo.web.app/asset-manifest.json', {method: 'GET', mode: 'cors'})
  .then(response => response.json())
  .then(manifest => {
    console.log('manifest', manifest);
    manifest.entrypoints.forEach(entrypoint => {
        const script = document.createElement('script');
        script.src = 'https://new-public-demo.web.app/' + entrypoint;
        document.head.appendChild(script);
    })
  })
  .catch(console.error);

