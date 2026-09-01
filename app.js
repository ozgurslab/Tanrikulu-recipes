const cfg=window.RECIPE_APP_CONFIG||{};
const configured=cfg.supabaseUrl&&!cfg.supabaseUrl.includes('YOUR_')&&cfg.supabaseAnonKey&&!cfg.supabaseAnonKey.includes('YOUR_');
const db=configured?supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey):null;
let categories=[],recipes=[],favorites=[],activeCategory='all',currentRecipe=null,currentTranslation=null,showingTranslation=false;
const LOGIN_USER='Tanrikulu',LOGIN_PASS='1943',$=id=>document.getElementById(id);
const icons={Soups:'🥣',Soup:'🥣',Salads:'🥗',Salad:'🥗',Beef:'🥩',Chicken:'🍗',Fish:'🐟',Shrimp:'🦐',Vegetables:'🥬',Vegetable:'🥬',Breakfast:'🍳',Rice:'🍚',Dessert:'🍰'};
async function init(){bind();if(sessionStorage.getItem('tanrikulu-recipes-login')!=='yes'){showLogin();return}hideLogin();await initAfterLogin()}
function showLogin(){$('loginScreen').classList.remove('hidden');document.querySelector('.app-shell').classList.add('locked')}
function hideLogin(){$('loginScreen').classList.add('hidden');document.querySelector('.app-shell').classList.remove('locked')}
function login(e){e.preventDefault();if($('loginUsername').value.trim()!==LOGIN_USER||$('loginPassword').value!==LOGIN_PASS){$('loginError').classList.remove('hidden');return}sessionStorage.setItem('tanrikulu-recipes-login','yes');hideLogin();initAfterLogin()}
function logout(){sessionStorage.removeItem('tanrikulu-recipes-login');location.reload()}
async function initAfterLogin(){try{await loadData();setStatus(true,'Family database connected')}catch(e){console.error(e);setStatus(false,'Database upgrade needed');toast('Run upgrade.sql in Supabase if needed')}}
async function loadData(){const [c,r,f]=await Promise.all([db.from('categories').select('*').order('sort_order'),db.from('recipes').select('*').order('recipe_number'),db.from('favorites').select('*')]);if(c.error)throw c.error;if(r.error)throw r.error;if(f.error)throw f.error;categories=c.data;recipes=r.data;favorites=f.data;render()}
function bind(){$('loginForm').onsubmit=login;$('logoutBtn').onclick=logout;$('newRecipeBtn').onclick=()=>openRecipeModal();$('addCategoryBtn').onclick=()=>$('categoryDialog').showModal();$('settingsBtn').onclick=()=>$('settingsDialog').showModal();$('randomBtn').onclick=randomRecipe;$('menuBtn').onclick=(e)=>{e.stopPropagation();$('sidebar').classList.toggle('open')};document.addEventListener('click',e=>{if($('sidebar').classList.contains('open')&&!$('sidebar').contains(e.target)&&!$('menuBtn').contains(e.target))$('sidebar').classList.remove('open')});$('searchInput').oninput=renderRecipes;$('recipeForm').onsubmit=saveRecipe;$('categoryForm').onsubmit=saveCategory;$('deleteRecipeBtn').onclick=deleteRecipe;$('deleteRecipeViewBtn').onclick=deleteRecipeFromView;$('editRecipeBtn').onclick=()=>{$('viewDialog').close();openRecipeModal(currentRecipe)};$('favoriteBtn').onclick=addFavorite;$('translateRecipeBtn').onclick=toggleTranslation;document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close())}
function render(){renderCategories();$('recipeCategory').innerHTML=categories.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');renderRecipes()}
function renderCategories(){const list=$('categoryList');list.innerHTML=`<div class="category-item ${activeCategory==='all'?'active':''}" data-id="all"><span>⌂</span><span>All recipes</span><span class="count">${recipes.length}</span></div>`+categories.map(c=>`<div class="category-item ${activeCategory===String(c.id)?'active':''}" data-id="${c.id}"><span>${icons[c.name]||'•'}</span><span>${esc(c.name)}</span><span class="count">${recipes.filter(r=>String(r.category_id)===String(c.id)).length}</span></div>`).join('');list.querySelectorAll('.category-item').forEach(el=>el.onclick=()=>{activeCategory=el.dataset.id;$('sidebar').classList.remove('open');render()})}
function renderRecipes(){const q=$('searchInput').value.toLowerCase().trim();let shown=recipes.filter(r=>(activeCategory==='all'||String(r.category_id)===activeCategory)&&(!q||[r.name,r.ingredients,r.notes].join(' ').toLowerCase().includes(q)));const cat=categories.find(c=>String(c.id)===activeCategory);$('pageTitle').textContent=cat?cat.name:'All Recipes';$('pageSubtitle').textContent=cat?`Browse the family’s ${cat.name.toLowerCase()} recipes.`:'A shared collection of family favourites.';$('recipeCount').textContent=shown.length;$('recipeGrid').innerHTML=shown.map(r=>{const c=categories.find(x=>String(x.id)===String(r.category_id)),fc=favorites.filter(f=>String(f.recipe_id)===String(r.id)).length;const linkOnly=!!r.source_url&&!r.ingredients&&!r.method&&!r.notes;return `<article class="recipe-card${linkOnly?' link-only':''}" data-id="${r.id}">${r.photo_url?`<img class="photo-thumb" src="${esc(r.photo_url)}" alt="">`:''}<div class="card-top"><span class="number">#${String(r.recipe_number||0).padStart(3,'0')}</span><span class="tag">${esc(c?.name||'Recipe')}</span></div><h3>${esc(r.name)}</h3>${r.contributor_name?`<div class="card-byline">by ${esc(r.contributor_name)}</div>`:''}<div class="card-meta">${r.total_time?`<span class="tag time-tag">⏱ ${esc(r.total_time)}</span>`:''}${r.servings?`<span>Serves ${esc(r.servings)}</span>`:''}${fc?`<span>❤️ ${fc}</span>`:''}</div></article>`}).join('');$('emptyState').classList.toggle('hidden',shown.length>0);document.querySelectorAll('.recipe-card').forEach(el=>el.onclick=()=>viewRecipe(recipes.find(r=>String(r.id)===el.dataset.id)))}
function openRecipeModal(r=null){currentRecipe=r;$('recipeModalTitle').textContent=r?'Edit recipe':'Add recipe';$('recipeId').value=r?.id||'';$('recipeContributor').value=r?.contributor_name||'';$('recipeName').value=r?.name||'';$('recipeCategory').value=r?.category_id||categories[0]?.id||'';$('recipeServings').value=r?.servings||'';$('recipePrep').value=r?.prep_time||'';$('recipeCook').value=r?.cook_time||'';$('recipeTotal').value=r?.total_time||'';$('recipeIngredients').value=r?.ingredients||'';$('recipeMethod').value=r?.method||'';$('recipeNotes').value=r?.notes||'';$('recipeSource').value=r?.source_url||'';$('recipePhotoUrl').value=r?.photo_url||'';$('recipePhoto').value='';$('deleteRecipeBtn').classList.toggle('hidden',!r);$('recipeDialog').showModal()}
async function uploadPhoto(){const file=$('recipePhoto').files[0];if(!file)return $('recipePhotoUrl').value;const ext=(file.name.split('.').pop()||'jpg').toLowerCase(),path=`${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;toast('Uploading photo…');const {error}=await db.storage.from('recipe-photos').upload(path,file,{upsert:false});if(error)throw error;return db.storage.from('recipe-photos').getPublicUrl(path).data.publicUrl}
function linkedRecipeName(url){
  try{
    const u=new URL(url),host=u.hostname.replace(/^www\./,'');
    const last=decodeURIComponent(u.pathname.split('/').filter(Boolean).pop()||'').replace(/[-_]+/g,' ').replace(/\.[a-z0-9]+$/i,'').trim();
    if(last){return last.replace(/\b\w/g,c=>c.toUpperCase()).slice(0,90)}
    return `Recipe from ${host}`;
  }catch{return 'Linked recipe'}
}
async function saveRecipe(e){
  e.preventDefault();
  try{
    const id=$('recipeId').value;
    const source_url=$('recipeSource').value.trim();
    let name=$('recipeName').value.trim();
    const ingredients=$('recipeIngredients').value.trim();
    const method=$('recipeMethod').value.trim();
    const isLinkOnly=!!source_url&&!name&&!ingredients&&!method;
    if(!source_url&&(!name||!ingredients||!method)){
      toast('Add a recipe link, or enter dish name, ingredients and method');
      return;
    }
    if(source_url&&!name)name=linkedRecipeName(source_url);
    const photo_url=await uploadPhoto();
    const categoryValue=$('recipeCategory').value;
    const payload={
      contributor_name:$('recipeContributor').value.trim(),
      name,
      category_id:categoryValue||null,
      servings:$('recipeServings').value.trim(),
      prep_time:$('recipePrep').value.trim(),
      cook_time:$('recipeCook').value.trim(),
      total_time:$('recipeTotal').value.trim(),
      ingredients,
      method,
      notes:$('recipeNotes').value.trim(),
      source_url,
      photo_url
    };
    let res=id?await db.from('recipes').update(payload).eq('id',id):await db.from('recipes').insert(payload);
    if(res.error)throw res.error;
    $('recipeDialog').close();
    await loadData();
    toast(isLinkOnly?'Recipe link saved':'Recipe saved');
  }catch(e){console.error(e);toast(e.message||'Could not save recipe')}
}
async function deleteRecipeFromView(){if(!currentRecipe||!confirm(`Delete “${currentRecipe.name}” permanently? This cannot be undone.`))return;const {error}=await db.from('recipes').delete().eq('id',currentRecipe.id);if(error)return toast(error.message);$('viewDialog').close();await loadData();toast('Recipe deleted')}
async function deleteRecipe(){if(!currentRecipe||!confirm(`Delete “${currentRecipe.name}”?`))return;const {error}=await db.from('recipes').delete().eq('id',currentRecipe.id);if(error)return toast(error.message);$('recipeDialog').close();await loadData();toast('Recipe deleted')}
async function saveCategory(e){e.preventDefault();const name=$('categoryName').value.trim();if(!name)return;const {error}=await db.from('categories').insert({name,sort_order:categories.length});if(error)return toast(error.message);$('categoryName').value='';$('categoryDialog').close();await loadData();toast('Category added')}
function viewRecipe(r){
  currentRecipe=r;currentTranslation=null;showingTranslation=false;
  const c=categories.find(x=>String(x.id)===String(r.category_id));
  $('viewCategory').textContent=c?.name||'RECIPE';
  $('viewNumber').textContent='#'+String(r.recipe_number||0).padStart(3,'0');
  $('viewPhoto').src=r.photo_url||'';$('viewPhoto').classList.toggle('hidden',!r.photo_url);
  $('viewMeta').innerHTML=[r.total_time&&`⏱ ${r.total_time}`,r.prep_time&&`Prep ${r.prep_time}`,r.cook_time&&`Cook ${r.cook_time}`,r.servings&&`Serves ${r.servings}`].filter(Boolean).map(x=>`<span class="meta-chip">${esc(x)}</span>`).join('');
  $('viewContributor').textContent=r.contributor_name||'';$('viewContributorWrap').classList.toggle('hidden',!r.contributor_name);
  $('viewSource').href=r.source_url||'#';$('viewSourceWrap').classList.toggle('hidden',!r.source_url);
  renderRecipeText(r);
  updateTranslateButton();
  renderFavorites();$('viewDialog').showModal()
}
function renderRecipeText(data){
  $('viewName').textContent=data.name||'';
  const ingredientItems=lines(data.ingredients);
  const methodItems=lines(data.method);
  $('viewIngredients').innerHTML=ingredientItems.map(x=>`<li>${esc(x)}</li>`).join('');
  $('viewMethod').innerHTML=methodItems.map(x=>`<li>${esc(x)}</li>`).join('');
  $('viewIngredientsWrap').classList.toggle('hidden',ingredientItems.length===0);
  $('viewMethodWrap').classList.toggle('hidden',methodItems.length===0);
  $('viewRecipeColumns').classList.toggle('hidden',ingredientItems.length===0&&methodItems.length===0);
  $('viewNotes').textContent=data.notes||'';
  $('viewNotesWrap').classList.toggle('hidden',!data.notes);
}
function recipeLanguage(r=currentRecipe){
  const t=[r?.name,r?.ingredients,r?.method,r?.notes].filter(Boolean).join(' ').toLowerCase();
  return /[çğıöşüİı]/i.test(t)||/(\bve\b|\biçin\b|\byemek\b|\bbardak\b|\badet\b|\bdakika\b|\bmalzeme\b|\btuz\b|\bkarabiber\b)/i.test(t)?'tr':'en';
}
function updateTranslateButton(){
  if(!currentRecipe)return;
  const src=recipeLanguage(currentRecipe),target=src==='tr'?'en':'tr';
  $('translateRecipeBtn').textContent=showingTranslation?'↩ Original':(target==='en'?'🌐 Translate to English':'🌐 Türkçeye çevir');
  $('viewLanguage').textContent=showingTranslation?(target==='en'?'English':'Türkçe'):(src==='tr'?'Türkçe':'English');
}
async function toggleTranslation(){
  if(!currentRecipe)return;
  if(showingTranslation){showingTranslation=false;renderRecipeText(currentRecipe);updateTranslateButton();return}
  const src=recipeLanguage(currentRecipe),target=src==='tr'?'en':'tr';
  const btn=$('translateRecipeBtn');btn.disabled=true;btn.textContent='Translating…';
  try{
    const cacheKey=`tr-recipes-translation-v1:${currentRecipe.id}:${currentRecipe.updated_at||''}:${target}`;
    const cached=localStorage.getItem(cacheKey);
    if(cached){currentTranslation=JSON.parse(cached)}
    else{
      currentTranslation={
        name:await translateText(currentRecipe.name||'',src,target),
        ingredients:await translateText(currentRecipe.ingredients||'',src,target),
        method:await translateText(currentRecipe.method||'',src,target),
        notes:await translateText(currentRecipe.notes||'',src,target)
      };
      localStorage.setItem(cacheKey,JSON.stringify(currentTranslation));
    }
    showingTranslation=true;renderRecipeText(currentTranslation);updateTranslateButton();
  }catch(e){console.error(e);toast('Translation service is temporarily unavailable')}
  finally{btn.disabled=false;updateTranslateButton()}
}
async function translateText(text,src,target){
  if(!text.trim())return '';
  const output=[];
  for(const line of text.split('\n')){
    if(!line.trim()){output.push('');continue}
    const chunks=splitTranslationChunks(line,180),translated=[];
    for(const chunk of chunks){
      const url=`https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${src}%7C${target}&mt=1`;
      const res=await fetch(url);if(!res.ok)throw new Error('Translation request failed');
      const data=await res.json();
      let value=data?.responseData?.translatedText;if(!value)throw new Error('No translation returned');
      const decoder=document.createElement('textarea');decoder.innerHTML=value;translated.push(decoder.value);
    }
    output.push(translated.join(' '));
  }
  return output.join('\n');
}
function splitTranslationChunks(text,maxChars=180){
  const words=text.split(/\s+/),out=[];let cur='';
  for(const word of words){const next=cur?cur+' '+word:word;if(next.length>maxChars&&cur){out.push(cur);cur=word}else cur=next}
  if(cur)out.push(cur);return out;
}
function renderFavorites(){const fs=favorites.filter(f=>String(f.recipe_id)===String(currentRecipe?.id));$('favoriteNames').innerHTML=fs.length?fs.map(f=>`<span class="favorite-chip">❤️ ${esc(f.family_name)} <button type="button" onclick="removeFavorite(${f.id})">×</button></span>`).join(''):'<span class="help">No favourites yet</span>'}
async function addFavorite(){const family_name=$('favoriteName').value.trim();if(!family_name||!currentRecipe)return;const {error}=await db.from('favorites').insert({recipe_id:currentRecipe.id,family_name});if(error&&error.code!=='23505')return toast(error.message);$('favoriteName').value='';await loadData();currentRecipe=recipes.find(r=>String(r.id)===String(currentRecipe.id));renderFavorites();toast('Favourite added')}
window.removeFavorite=async id=>{const {error}=await db.from('favorites').delete().eq('id',id);if(error)return toast(error.message);await loadData();renderFavorites()}
function randomRecipe(){let pool=recipes.filter(r=>activeCategory==='all'||String(r.category_id)===activeCategory);if(pool.length)viewRecipe(pool[Math.floor(Math.random()*pool.length)]);else toast('Add a recipe first')}
function lines(s){return(s||'').split('\n').map(x=>x.trim()).filter(Boolean)}function esc(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}function toast(s){$('toast').textContent=s;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2600)}function setStatus(ok,text){$('syncStatus').textContent=text;$('connectionTitle').textContent=ok?'Connected':'Needs attention';$('connectionDetail').textContent=text;$('connectionDot').style.background=ok?'#4f8c67':'#c98d31'}
init();
