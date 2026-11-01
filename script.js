document.addEventListener('DOMContentLoaded',()=>{
  const menuToggle=document.getElementById('menu-toggle');
  const nav=document.getElementById('nav-menu');
  menuToggle?.addEventListener('click',()=>{nav.classList.toggle('open');menuToggle.innerHTML=nav.classList.contains('open')?'<i class="ri-close-line"></i>':'<i class="ri-menu-4-line"></i>'});
  document.querySelectorAll('.nav-link').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

  const words=['Data Analyst','Data Science Intern','Power BI Learner','Open Source Contributor'];
  const typing=document.getElementById('typing-text');let wi=0,ci=0,deleting=false;
  function type(){const word=words[wi];typing.textContent=word.slice(0,ci);if(!deleting){ci++;if(ci>word.length){deleting=true;setTimeout(type,1200);return}}else{ci--;if(ci===0){deleting=false;wi=(wi+1)%words.length}}setTimeout(type,deleting?45:80)}type();

  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

  const sections=[...document.querySelectorAll('main section[id]')];const links=[...document.querySelectorAll('.nav-link')];
  const sectionObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){links.forEach(l=>l.classList.toggle('active',l.getAttribute('href')==='#'+entry.target.id))}}),{rootMargin:'-35% 0px -55% 0px',threshold:0});
  sections.forEach(s=>sectionObserver.observe(s));

  const dot=document.getElementById('cursor-dot');window.addEventListener('mousemove',e=>{if(dot){dot.style.left=e.clientX+'px';dot.style.top=e.clientY+'px'}});
});
