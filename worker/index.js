const worker = {
  async fetch(request, env) {
    if (new URL(request.url).pathname === '/api/inquiry') {
      return Response.json({ok:false,message:'Online inquiries are temporarily unavailable. Please call 607-693-1364 or email inquiries@beldenhomesinc.com.'},{status:503});
    }
    return env.ASSETS.fetch(request);
  },
};

export default worker;
