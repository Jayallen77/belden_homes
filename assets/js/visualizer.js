// The original application loads directly in the generated page's iframe.
// These controls enhance it without delaying loading or requiring a click.
const mount=document.querySelector('#visualizer-mount');const status=document.querySelector('#visualizer-status');const expand=document.querySelector('#visualizer-fullscreen');
if(expand&&mount)expand.hidden=!mount.requestFullscreen;
expand?.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await mount.requestFullscreen();}catch{status.textContent='Full-screen view is not available in this browser. You can continue using the tool below.';}});document.addEventListener('fullscreenchange',()=>{expand.textContent=document.fullscreenElement?'Exit expanded view':'Expand visualizer';});
