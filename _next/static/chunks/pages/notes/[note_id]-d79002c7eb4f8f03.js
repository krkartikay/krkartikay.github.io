(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[109],{6828:function(e,t,s){(window.__NEXT_P=window.__NEXT_P||[]).push(["/notes/[note_id]",function(){return s(4411)}])},7970:function(e,t,s){"use strict";s.d(t,{Z:function(){return d}});var n=s(5893),l=s(1664),i=s.n(l),a=s(5675),r=s.n(a);function c(e){return e.replace(/\w\S*/g,function(e){return e.charAt(0).toUpperCase()+e.substr(1).toLowerCase()})}function o(e){let{allNotesIndex:t,prefix:s}=e;s||(s="");let l=[];for(let e of t.notes_data){if("index"==e.id)continue;let t=(0,n.jsx)(i(),{href:"/notes/".concat(s).concat(e.id),children:(0,n.jsx)("li",{className:"py-2 pl-2 hover:bg-stone-100 hover:text-stone-600 list-inside",children:e.metadata.title})},e.id);l.push({title:e.metadata.title,page:t})}for(let e of t.directories){let t=(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(i(),{href:"/notes/".concat(s).concat(e.base_name,"__index"),children:(0,n.jsx)("li",{className:"py-2 pl-2 hover:bg-stone-100 hover:text-stone-600 list-inside",children:c(e.base_name)})},e.base_name),(0,n.jsx)(o,{allNotesIndex:e,prefix:s+e.base_name+"__"})]});l.push({title:c(e.base_name),page:t})}return l.sort((e,t)=>e.title<t.title?-1:e.title==t.title?0:1),(0,n.jsx)(n.Fragment,{children:(0,n.jsx)("ul",{className:"list-disc pl-8",children:l.map(e=>{let{title:t,page:s}=e;return s})})})}function d(e){let{allNotesIndex:t,children:s}=e;return(0,n.jsxs)("div",{children:[(0,n.jsx)("nav",{className:"md:sticky md:top-0 md:z-40 shadow-sm p-2 bg-white",children:(0,n.jsx)("div",{className:"flex items-center",children:(0,n.jsxs)(i(),{href:"/",className:"flex",children:[(0,n.jsx)(r(),{src:"/pfp_blank.png",alt:"Profile pic",width:100,height:100,className:"rounded-full h-20 w-20 mx-2"}),(0,n.jsx)("h1",{className:"self-center text-xl text-stone-400 font-mono",children:"krkartikay's notes"})]})})}),(0,n.jsxs)("div",{className:"flex flex-row flex-wrap",children:[(0,n.jsx)("aside",{className:"sm:w-1/4 text-stone-500",children:(0,n.jsxs)("div",{className:"max-w-xs mx-auto py-8",children:[(0,n.jsx)(i(),{href:"/",children:(0,n.jsx)("h2",{className:"p-8 text-lg text-stone-600 hover:bg-stone-100",children:"Notes"})}),(0,n.jsx)(o,{allNotesIndex:t})]})}),(0,n.jsx)("main",{className:"sm:w-3/4",children:(0,n.jsx)("div",{className:"p-8 md:p-16",children:(0,n.jsx)("div",{className:"prose prose-stone",children:s})})})]})]})}},4411:function(e,t,s){"use strict";s.r(t),s.d(t,{__N_SSG:function(){return r},default:function(){return c}});var n=s(5893),l=s(7970),i=s(9008),a=s.n(i),r=!0;function c(e){let{noteData:t,allNotesIndex:s}=e;return(0,n.jsxs)(l.Z,{allNotesIndex:s,children:[(0,n.jsx)(a(),{children:(0,n.jsx)("title",{children:t.metadata.title})}),(0,n.jsx)("br",{}),(0,n.jsx)("h1",{children:t.metadata.title}),(0,n.jsx)("p",{children:t.metadata.date}),(0,n.jsx)("br",{}),(0,n.jsx)("div",{className:"prose",children:(0,n.jsx)("div",{dangerouslySetInnerHTML:{__html:t.content}})})]})}},9008:function(e,t,s){e.exports=s(2636)}},function(e){e.O(0,[61,774,888,179],function(){return e(e.s=6828)}),_N_E=e.O()}]);