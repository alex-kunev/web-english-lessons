export default {
  async fetch(request, env, ctx) {
    // Get the asset from the static files
    const url = new URL(request.url);
    
    // Log request details for observability
    console.log({
      timestamp: new Date().toISOString(),
      method: request.method,
      url: url.pathname,
      userAgent: request.headers.get('user-agent'),
      country: request.cf?.country,
      city: request.cf?.city,
    });

    try {
      // Serve static assets
      const response = await env.ASSETS.fetch(request);
      
      // Add custom headers for better analytics
      const newResponse = new Response(response.body, response);
      newResponse.headers.set('X-Served-By', 'Cloudflare-Worker');
      newResponse.headers.set('X-Response-Time', Date.now().toString());
      
      // Log response status
      console.log({
        status: response.status,
        contentType: response.headers.get('content-type'),
      });
      
      return newResponse;
    } catch (error) {
      // Log errors for monitoring
      console.error({
        error: error.message,
        stack: error.stack,
        url: url.pathname,
      });
      
      return new Response('Error serving asset', { 
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  },
};
