(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[109],{6828:function(e,t,n){(window.__NEXT_P=window.__NEXT_P||[]).push(["/notes/[note_id]",function(){return n(4411)}])},7970:function(e,t,n){"use strict";n.d(t,{Z:function(){return d}});var s=n(5893),a=n(1664),l=n.n(a),i=n(5675),r=n.n(i);function c(e){return e.replace(/\w\S*/g,function(e){return e.charAt(0).toUpperCase()+e.substr(1).toLowerCase()})}function o(e){let{allNotesIndex:t,prefix:n,current_note_id:a}=e;n||(n="");let i=[];for(let e of t.notes_data){if("index"==e.id)continue;let t=(0,s.jsx)(l(),{href:"/notes/".concat(n).concat(e.id),children:(0,s.jsx)("li",{className:"py-2 pl-2 hover:bg-stone-100 hover:text-stone-600 list-inside ".concat(n+e.id==a?"bg-stone-50 font-bold":""),children:e.metadata.title})},e.id);i.push({title:e.metadata.title,page:t})}for(let e of t.directories){let t=(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(l(),{href:"/notes/".concat(n).concat(e.base_name,"__index"),children:(0,s.jsx)("li",{className:"py-2 pl-2 hover:bg-stone-100 hover:text-stone-600 list-inside ".concat(n+e.base_name+"__index"==a?"bg-stone-50 font-bold":""),children:c(e.base_name)})},e.base_name),(0,s.jsx)(o,{allNotesIndex:e,prefix:n+e.base_name+"__",current_note_id:a})]});i.push({title:c(e.base_name),page:t})}return i.sort((e,t)=>e.title<t.title?-1:e.title==t.title?0:1),(0,s.jsx)(s.Fragment,{children:(0,s.jsx)("ul",{className:"list-disc pl-8",children:i.map(e=>{let{title:t,page:n}=e;return n})})})}function d(e){let{allNotesIndex:t,note_id:n,children:a}=e;return(0,s.jsxs)("div",{children:[(0,s.jsx)("nav",{className:"md:sticky md:top-0 md:z-40 shadow-sm p-2 bg-white",children:(0,s.jsx)("div",{className:"flex items-center",children:(0,s.jsxs)(l(),{href:"/",className:"flex",children:[(0,s.jsx)(r(),{src:"/pfp_blank.png",alt:"Profile pic",width:100,height:100,className:"rounded-full h-20 w-20 mx-2"}),(0,s.jsx)("h1",{className:"self-center text-xl text-stone-400 font-mono",children:"krkartikay's notes"})]})})}),(0,s.jsxs)("div",{className:"flex flex-row flex-wrap",children:[(0,s.jsx)("aside",{className:"sm:w-1/4 text-stone-500",children:(0,s.jsxs)("div",{className:"max-w-xs mx-auto py-8",children:[(0,s.jsx)(l(),{href:"/",children:(0,s.jsx)("h2",{className:"p-8 text-lg text-stone-600 hover:bg-stone-100 ".concat(""==n?"font-bold":""),children:"Notes"})}),(0,s.jsx)(o,{allNotesIndex:t,current_note_id:n})]})}),(0,s.jsx)("main",{className:"sm:w-3/4",children:(0,s.jsx)("div",{className:"p-8 md:p-16",children:a})})]})]})}},4411:function(e,t,n){"use strict";n.r(t),n.d(t,{__N_SSG:function(){return r},default:function(){return c}});var s=n(5893),a=n(7970),l=n(9008),i=n.n(l),r=!0;function c(e){let{note_id:t,noteData:n,allNotesIndex:l}=e;return console.log(t),(0,s.jsxs)(a.Z,{allNotesIndex:l,note_id:t,children:[(0,s.jsx)(i(),{children:(0,s.jsx)("title",{children:n.metadata.title?n.metadata.title:t.replace(/__/g," / ")})}),(0,s.jsx)("br",{}),(0,s.jsx)("h1",{className:"text-4xl",children:n.metadata.title}),n.metadata.date?(0,s.jsx)("p",{className:"text-stone-400",children:n.metadata.date}):(0,s.jsx)("br",{}),(0,s.jsx)("div",{className:"prose prose-stone",children:(0,s.jsx)("div",{dangerouslySetInnerHTML:{__html:n.content}})})]})}}},function(e){e.O(0,[247,774,888,179],function(){return e(e.s=6828)}),_N_E=e.O()}]);