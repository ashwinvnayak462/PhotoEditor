const collage=document.querySelector('#collage');
const photoInput=document.querySelector('#photo-input');
const addButton=document.querySelector('#add-button');
const saveButton=document.querySelector('#save-button');
const status=document.querySelector('#status');
const installButton=document.querySelector('#install-button');
const rotateButton=document.querySelector('#rotate-button');
const replaceButton=document.querySelector('#replace-button');
const filterSelect=document.querySelector('#filter-select');
const brightnessInput=document.querySelector('#brightness-input');
const contrastInput=document.querySelector('#contrast-input');
const selectedLabel=document.querySelector('#selected-label');
const captionInput=document.querySelector('#caption-input');
const gapInput=document.querySelector('#gap-input');
const gapValue=document.querySelector('#gap-value');
const brightnessValue=document.querySelector('#brightness-value');
const contrastValue=document.querySelector('#contrast-value');

let photos=[null,null,null,null];
let selectedIndex=null;
let replaceIndex=null;
let installPrompt;
const style={background:'#ffffff',gap:5,radius:0,caption:''};
const filterValues={original:'',mono:'grayscale(1)',warm:'sepia(.28) saturate(1.15)',cool:'saturate(.9) hue-rotate(12deg)',vivid:'saturate(1.45) contrast(1.08)'};

function photoFilter(photo){return `brightness(${photo.brightness}%) contrast(${photo.contrast}%) ${filterValues[photo.filter]}`.trim()}
function updateTools(){
  const photo=photos[selectedIndex];
  const enabled=Boolean(photo);
  [rotateButton,replaceButton,filterSelect,brightnessInput,contrastInput].forEach(control=>control.disabled=!enabled);
  selectedLabel.textContent=enabled?`Photo ${selectedIndex+1}`:'Select a photo';
  if(enabled){filterSelect.value=photo.filter;brightnessInput.value=photo.brightness;contrastInput.value=photo.contrast;brightnessValue.textContent=`${photo.brightness}%`;contrastValue.textContent=`${photo.contrast}%`}
}
function updateStatus(){const count=photos.filter(Boolean).length;status.textContent=count?`${count} of 4 photo${count===1?'':'s'} added. Select a photo to edit it.`:'Add up to 4 photos to begin.';saveButton.disabled=count===0}
function render(){
  collage.style.setProperty('--gap',`${style.gap}px`);collage.style.setProperty('--radius',`${style.radius}px`);collage.style.setProperty('--canvas',style.background);
  const tiles=photos.map((photo,index)=>{
    const tile=document.createElement('button');tile.type='button';tile.className=`tile${photo?'':' empty'}${selectedIndex===index?' selected':''}`;tile.setAttribute('aria-label',photo?`Edit photo ${index+1}`:`Add photo ${index+1}`);
    if(photo){const image=new Image();image.src=photo.src;image.alt=`Photo ${index+1}`;image.style.filter=photoFilter(photo);image.style.transform=`rotate(${photo.rotation}deg) scale(${photo.rotation%180===0?1:1.42})`;tile.append(image)}
    tile.addEventListener('click',()=>{if(photo){selectedIndex=index;render()}else{replaceIndex=index;photoInput.click()}});return tile;
  });
  collage.replaceChildren(...tiles);
  if(style.caption){const caption=document.createElement('div');caption.className='caption-preview';caption.textContent=style.caption;collage.append(caption)}
  updateTools();updateStatus();
}
function toPhoto(src){return {src,rotation:0,filter:'original',brightness:100,contrast:100}}
function readFiles(files){
  const selected=[...files].filter(file=>file.type.startsWith('image/')).slice(0,4);if(!selected.length)return;
  Promise.all(selected.map(file=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file)}))).then(images=>{
    if(replaceIndex!==null){photos[replaceIndex]=toPhoto(images[0]);selectedIndex=replaceIndex;replaceIndex=null}
    else{let cursor=0;photos=photos.map(photo=>{if(photo)return photo;const source=images[cursor++];return source?toPhoto(source):null});selectedIndex=photos.findIndex(Boolean)}
    render();
  }).catch(()=>status.textContent='One of those photos could not be opened. Please try another image.');
}
function loadImage(src){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=src})}
function roundRectPath(ctx,x,y,width,height,radius){const r=Math.min(radius,width/2,height/2);ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+width,y,x+width,y+height,r);ctx.arcTo(x+width,y+height,x,y+height,r);ctx.arcTo(x,y+height,x,y,r);ctx.arcTo(x,y,x+width,y,r);ctx.closePath()}
async function saveCollage(){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=1600;const ctx=canvas.getContext('2d');ctx.fillStyle=style.background;ctx.fillRect(0,0,1600,1600);
  const gap=style.gap*4;const size=(1600-gap)/2;const cells=[[0,0],[size+gap,0],[0,size+gap],[size+gap,size+gap]];
  for(let index=0;index<4;index++){const photo=photos[index];if(!photo)continue;const image=await loadImage(photo.src);const rotation=((photo.rotation%360)+360)%360;ctx.save();if(style.radius){const x=cells[index][0],y=cells[index][1],r=style.radius*4;roundRectPath(ctx,x,y,size,size,r);ctx.clip()}else{ctx.beginPath();ctx.rect(cells[index][0],cells[index][1],size,size);ctx.clip()}ctx.filter=photoFilter(photo);ctx.translate(cells[index][0]+size/2,cells[index][1]+size/2);ctx.rotate(rotation*Math.PI/180);const scale=Math.max(size/image.naturalWidth,size/image.naturalHeight)*(rotation%180?1.42:1);const width=image.naturalWidth*scale,height=image.naturalHeight*scale;ctx.drawImage(image,-width/2,-height/2,width,height);ctx.restore()}
  if(style.caption){ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(0,1450,1600,150);ctx.fillStyle='#fff';ctx.font='700 54px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(style.caption,800,1525)}
  const link=document.createElement('a');link.download='avneditor-collage.png';link.href=canvas.toDataURL('image/png');link.click();status.textContent='Your collage has been saved.';
}
addButton.addEventListener('click',()=>{replaceIndex=null;photoInput.click()});photoInput.addEventListener('change',event=>{readFiles(event.target.files);event.target.value=''});saveButton.addEventListener('click',saveCollage);
rotateButton.addEventListener('click',()=>{photos[selectedIndex].rotation=(photos[selectedIndex].rotation+90)%360;render()});replaceButton.addEventListener('click',()=>{replaceIndex=selectedIndex;photoInput.click()});
filterSelect.addEventListener('change',()=>{photos[selectedIndex].filter=filterSelect.value;render()});brightnessInput.addEventListener('input',()=>{photos[selectedIndex].brightness=Number(brightnessInput.value);render()});contrastInput.addEventListener('input',()=>{photos[selectedIndex].contrast=Number(contrastInput.value);render()});
captionInput.addEventListener('input',()=>{style.caption=captionInput.value.trim();render()});gapInput.addEventListener('input',()=>{style.gap=Number(gapInput.value);gapValue.textContent=`${style.gap}px`;render()});
document.querySelectorAll('#background-options button').forEach(button=>button.addEventListener('click',()=>{style.background=button.dataset.color;document.querySelectorAll('#background-options button').forEach(item=>item.classList.toggle('active',item===button));render()}));
document.querySelectorAll('.segment').forEach(button=>button.addEventListener('click',()=>{style.radius=Number(button.dataset.radius);document.querySelectorAll('.segment').forEach(item=>item.classList.toggle('active',item===button));render()}));
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;installButton.classList.remove('hidden')});installButton.addEventListener('click',async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;installButton.classList.add('hidden')});if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js'));render();
