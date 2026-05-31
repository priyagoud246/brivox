import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useAuth, API } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const SECTOR_COLORS = {
  "Fintech":       {bg:"#eff6ff",txt:"#1d4ed8"},
  "Healthcare":    {bg:"#f0fdf4",txt:"#16a34a"},
  "SaaS":          {bg:"#faf5ff",txt:"#7c3aed"},
  "Edtech":        {bg:"#fffbeb",txt:"#b45309"},
  "Consumer Tech": {bg:"#ecfeff",txt:"#0e7490"},
  "B2B Commerce":  {bg:"#fff1f2",txt:"#be123c"},
  "Multi-sector":  {bg:"#f8fafc",txt:"#475569"},
}

function initials(name) {
  return name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() || '??'
}

function eduLabel(e='') {
  if (e.includes('Doctor')) return 'PhD'
  if (e.includes('Chartered')) return 'CA'
  if (e.includes('Bachelor')) return 'BSc'
  if (e.includes('Diploma')) return 'Dip'
  return 'MSc'
}

/* ── Profile Modal ── */
function ProfileModal({ sme, onClose }) {
  const sc = SECTOR_COLORS[sme.sector] || SECTOR_COLORS["Multi-sector"]
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const exportVCard = () => {
    const blob = new Blob([
      `BEGIN:VCARD\nVERSION:3.0\nFN:${sme.name}\nTITLE:${sme.role}\nNOTE:Sector: ${sme.sector} | Network: ${sme.affiliation} | Location: ${sme.location}\nEND:VCARD`
    ], {type:'text/vcard'})
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${sme.name.replace(/ /g,'_')}.vcf`
    a.click()
  }

  return (
    <div onClick={onClose} style={{
      position:'fixed',inset:0,background:'rgba(15,17,23,.55)',
      zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',
      padding:'1rem',backdropFilter:'blur(4px)'
    }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:'#fff',borderRadius:'20px',width:'100%',maxWidth:'560px',
        maxHeight:'90vh',overflowY:'auto',boxShadow:'0 24px 64px rgba(15,17,23,.2)',
        fontFamily:'DM Sans,sans-serif'
      }}>
        {/* Modal Header */}
        <div style={{
          background:`linear-gradient(135deg,${sme.color}22,${sme.color}08)`,
          padding:'2rem 2rem 1.5rem',borderBottom:'1px solid #e2e6ef',
          display:'flex',justifyContent:'space-between',alignItems:'flex-start'
        }}>
          <div style={{display:'flex',gap:'1rem',alignItems:'center'}}>
            <div style={{
              width:'64px',height:'64px',borderRadius:'14px',
              background:sme.color||'#1a56db',display:'flex',
              alignItems:'center',justifyContent:'center',
              fontFamily:'Playfair Display,serif',fontSize:'1.4rem',
              fontWeight:'700',color:'#fff',flexShrink:0
            }}>{initials(sme.name)}</div>
            <div>
              <h2 style={{fontFamily:'Playfair Display,serif',fontSize:'1.3rem',fontWeight:'700',color:'#0f1117',marginBottom:'4px'}}>{sme.name}</h2>
              <p style={{fontSize:'.85rem',color:'#3d4455',marginBottom:'4px'}}>{sme.role}</p>
              <p style={{fontSize:'.78rem',color:'#8891a8'}}>📍 {sme.flag} {sme.location}</p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background:'none',border:'1px solid #e2e6ef',borderRadius:'8px',
            width:'32px',height:'32px',cursor:'pointer',fontSize:'1.1rem',color:'#8891a8',
            display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0
          }}>✕</button>
        </div>

        <div style={{padding:'1.5rem 2rem'}}>
          {/* Sector tag */}
          <span style={{
            background:sc.bg,color:sc.txt,borderRadius:'6px',
            padding:'.25rem .7rem',fontSize:'.75rem',fontWeight:'600',
            textTransform:'uppercase',letterSpacing:'.04em'
          }}>{sme.sector}</span>

          {/* Stats */}
          <div style={{
            display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1px',
            background:'#e2e6ef',borderRadius:'12px',overflow:'hidden',margin:'1.2rem 0'
          }}>
            {[
              [sme.profExp+'+','Total Experience','yrs'],
              [sme.domainExp+'+','Domain Expertise','yrs'],
              [eduLabel(sme.education),'Education','']
            ].map(([v,l,u])=>(
              <div key={l} style={{background:'#fff',padding:'1rem',textAlign:'center'}}>
                <strong style={{fontFamily:'Playfair Display,serif',fontSize:'1.4rem',fontWeight:'700',color:'#0f1117',display:'block'}}>{v}</strong>
                <small style={{fontSize:'.7rem',color:'#8891a8',textTransform:'uppercase',letterSpacing:'.03em'}}>{l}</small>
              </div>
            ))}
          </div>

          {/* Services */}
          {sme.services?.length > 0 && (
            <div style={{marginBottom:'1.2rem'}}>
              <p style={{fontSize:'.75rem',color:'#8891a8',fontWeight:'600',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'.5rem'}}>Areas of Expertise</p>
              <div style={{display:'flex',flexWrap:'wrap',gap:'.4rem'}}>
                {sme.services.map(sv=>(
                  <span key={sv} style={{background:'#eef2ff',color:'#1a56db',borderRadius:'20px',padding:'.2rem .7rem',fontSize:'.78rem',fontWeight:'500'}}>{sv}</span>
                ))}
              </div>
            </div>
          )}

          {/* Investment stage */}
          <div style={{background:'#f8fafc',borderRadius:'10px',padding:'1rem',marginBottom:'1.2rem'}}>
            <p style={{fontSize:'.75rem',color:'#8891a8',fontWeight:'600',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'.5rem'}}>Investment Stage</p>
            <p style={{fontSize:'.9rem',color:'#0f1117',fontWeight:'500'}}>{sme.stage || '—'}</p>
          </div>

          {/* Network / Affiliation */}
          <div style={{background:'#f8fafc',borderRadius:'10px',padding:'1rem',marginBottom:'1.5rem'}}>
            <p style={{fontSize:'.75rem',color:'#8891a8',fontWeight:'600',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:'.5rem'}}>Network & Affiliations</p>
            <p style={{fontSize:'.9rem',color:'#0f1117',fontWeight:'500'}}>{sme.affiliation || '—'}</p>
          </div>

          {/* Actions */}
          <div style={{display:'flex',gap:'.8rem'}}>
            <button onClick={exportVCard} style={{
              flex:1,padding:'.7rem',background:'#0f1117',color:'#fff',
              border:'none',borderRadius:'10px',fontSize:'.86rem',fontWeight:'600',
              cursor:'pointer',fontFamily:'inherit',transition:'background .2s'
            }}
            onMouseEnter={e=>e.target.style.background='#1a56db'}
            onMouseLeave={e=>e.target.style.background='#0f1117'}>
              ⬇ Export Contact (.vcf)
            </button>
            <button onClick={onClose} style={{
              flex:1,padding:'.7rem',background:'#fff',color:'#0f1117',
              border:'1px solid #e2e6ef',borderRadius:'10px',fontSize:'.86rem',
              fontWeight:'600',cursor:'pointer',fontFamily:'inherit'
            }}>Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── SME Card ── */
function SMECard({ s, onView }) {
  const sc = SECTOR_COLORS[s.sector] || SECTOR_COLORS["Multi-sector"]
  return (
    <div style={{
      background:'#fff',border:'1px solid #e2e6ef',borderRadius:'14px',
      overflow:'hidden',boxShadow:'0 4px 24px rgba(15,17,23,.07)',
      display:'flex',flexDirection:'column',
      transition:'transform .22s ease,box-shadow .22s ease',cursor:'default',
      fontFamily:'DM Sans,sans-serif'
    }}
    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 12px 48px rgba(15,17,23,.13)'}}
    onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 24px rgba(15,17,23,.07)'}}>

      {/* Header */}
      <div style={{padding:'1.3rem 1.3rem 0',display:'flex',alignItems:'flex-start',gap:'.9rem'}}>
        <div style={{
          width:'50px',height:'50px',borderRadius:'11px',
          background:s.color||'#1a56db',display:'flex',alignItems:'center',
          justifyContent:'center',fontFamily:'Playfair Display,serif',
          fontSize:'1.1rem',fontWeight:'700',color:'#fff',flexShrink:0
        }}>{initials(s.name)}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.05rem',fontWeight:'600',color:'#0f1117',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{s.name}</div>
          <div style={{fontSize:'.78rem',color:'#8891a8',marginTop:'2px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{s.role||'—'}</div>
          <div style={{display:'flex',alignItems:'center',gap:'4px',fontSize:'.76rem',color:'#8891a8',marginTop:'3px'}}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            {s.flag} {s.location}
          </div>
          <span style={{display:'inline-block',marginTop:'.6rem',borderRadius:'6px',padding:'.2rem .6rem',fontSize:'.72rem',fontWeight:'600',textTransform:'uppercase',letterSpacing:'.04em',background:sc.bg,color:sc.txt}}>{s.sector}</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:'flex',borderTop:'1px solid #e2e6ef',borderBottom:'1px solid #e2e6ef',marginTop:'.9rem'}}>
        {[[s.profExp+'+','Yrs Exp'],[s.domainExp+'+','Domain'],[eduLabel(s.education),'Edu']].map(([v,l],i)=>(
          <div key={l} style={{flex:1,textAlign:'center',padding:'.6rem .4rem',borderRight:i<2?'1px solid #e2e6ef':'none'}}>
            <strong style={{fontFamily:'Playfair Display,serif',fontSize:'1.05rem',fontWeight:'700',color:'#0f1117',display:'block'}}>{v}</strong>
            <small style={{fontSize:'.68rem',color:'#8891a8',textTransform:'uppercase',letterSpacing:'.03em'}}>{l}</small>
          </div>
        ))}
      </div>

      {/* Pills */}
      <div style={{padding:'.8rem 1.3rem',display:'flex',flexWrap:'wrap',gap:'.4rem',flex:1}}>
        {(s.services||[]).length > 0
          ? s.services.slice(0,4).map(sv=>(
            <span key={sv} style={{background:'#eef2ff',color:'#1a56db',borderRadius:'20px',padding:'.18rem .65rem',fontSize:'.73rem',fontWeight:'500'}}>{sv}</span>
          ))
          : <span style={{color:'#8891a8',fontSize:'.78rem'}}>—</span>
        }
      </div>

      {/* Footer */}
      <div style={{padding:'.85rem 1.3rem',borderTop:'1px solid #e2e6ef',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'.5rem'}}>
        <div style={{fontSize:'.74rem',color:'#8891a8',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'55%'}}>
          <strong style={{color:'#3d4455',fontWeight:'500'}}>Network:</strong> {s.affiliation||'—'}
        </div>
        <button onClick={()=>onView(s)} style={{
          background:'#0f1117',color:'#fff',border:'none',borderRadius:'8px',
          padding:'.28rem .75rem',fontSize:'.72rem',fontWeight:'600',
          cursor:'pointer',fontFamily:'inherit',transition:'background .2s',whiteSpace:'nowrap'
        }}
        onMouseEnter={e=>e.target.style.background='#1a56db'}
        onMouseLeave={e=>e.target.style.background='#0f1117'}>
          View Profile →
        </button>
      </div>
    </div>
  )
}

/* ── Main Directory Page ── */
const SECTORS = ['All','Fintech','Consumer Tech','Healthcare','SaaS','Edtech','B2B Commerce']

export default function Directory() {
  const [smes, setSmes]           = useState([])
  const [search, setSearch]       = useState('')
  const [sector, setSector]       = useState('All')
  const [sortBy, setSortBy]       = useState('default')
  const [loading, setLoading]     = useState(true)
  const [nearMode, setNearMode]   = useState(false)
  const [error, setError]         = useState('')
  const [selected, setSelected]   = useState(null)
  const [showTop, setShowTop]     = useState(false)
  const debounceRef = useRef(null)

  const fetchSMEs = async (sec=sector, q=search) => {
    try {
      setLoading(true); setError('')
      const { data } = await axios.get(`${API}/sme`, {
        params:{ sector:sec, search:q }, withCredentials:true
      })
      setSmes(data)
    } catch(err) {
      setError('Could not load experts: ' + (err.response?.data?.error||err.message))
    } finally { setLoading(false) }
  }

  // Live search with debounce
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSMEs(sector, search), 350)
  }, [search, sector])

  // Back to top listener
  useEffect(() => {
    const handler = () => setShowTop(window.scrollY > 400)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const findNearest = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported')
    navigator.geolocation.getCurrentPosition(async ({coords}) => {
      try {
        setLoading(true)
        const { data } = await axios.get(`${API}/sme/nearest`, {
          params:{ lat:coords.latitude, lng:coords.longitude }, withCredentials:true
        })
        setSmes(data); setNearMode(true)
      } catch(err) { setError('Location search failed: '+err.message) }
      finally { setLoading(false) }
    }, ()=>alert('Please allow location access'))
  }

  const sorted = [...smes].sort((a,b)=>{
    if (sortBy==='exp')    return b.profExp - a.profExp
    if (sortBy==='domain') return b.domainExp - a.domainExp
    if (sortBy==='name')   return a.name.localeCompare(b.name)
    return 0
  })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'DM Sans',sans-serif;background:#fff;color:#0f1117;}
        .chip{background:#f0f2f7;border:1.5px solid transparent;color:#3d4455;border-radius:20px;padding:.3rem .85rem;font-size:.8rem;font-weight:500;cursor:pointer;font-family:inherit;transition:all .18s;}
        .chip:hover,.chip.active{background:#0f1117;color:#fff;border-color:#0f1117;}
        .nearest-btn{background:#1a56db;color:#fff;border:none;border-radius:20px;padding:.3rem .85rem;font-size:.8rem;font-weight:500;cursor:pointer;font-family:inherit;transition:background .2s;}
        .nearest-btn:hover{background:#1648c0;}
        .sort-select{border:1px solid #e2e6ef;border-radius:20px;padding:.3rem .85rem;font-size:.8rem;color:#3d4455;font-family:inherit;cursor:pointer;outline:none;background:#fff;}
        .card-grid{padding:2.5rem 5vw 5rem;display:grid;grid-template-columns:repeat(auto-fill,minmax(310px,1fr));gap:1.5rem;}
        .search-input{flex:1;border:none;outline:none;font-family:inherit;font-size:.93rem;color:#0f1117;background:transparent;}
        .search-input::placeholder{color:#8891a8;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .card-anim{animation:fadeUp .4s ease both;}
        .back-top{position:fixed;bottom:2rem;right:2rem;width:44px;height:44px;background:#0f1117;color:#fff;border:none;border-radius:50%;font-size:1.1rem;cursor:pointer;box-shadow:0 4px 16px rgba(15,17,23,.2);transition:background .2s;z-index:50;display:flex;align-items:center;justify-content:center;}
        .back-top:hover{background:#1a56db;}
        .skeleton{background:linear-gradient(90deg,#f0f2f7 25%,#e2e6ef 50%,#f0f2f7 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>

      <Navbar />

      {/* HERO */}
      <section style={{
        padding:'80px 5vw 60px',display:'flex',flexDirection:'column',
        alignItems:'center',textAlign:'center',
        background:'linear-gradient(168deg,#f7f9ff 0%,#fff 55%)',
        borderBottom:'1px solid #e2e6ef'
      }}>
        <div style={{display:'inline-flex',alignItems:'center',gap:'7px',background:'#fdf3d7',color:'#7a5c0a',borderRadius:'20px',padding:'.28rem .9rem',fontSize:'.76rem',fontWeight:'600',letterSpacing:'.06em',textTransform:'uppercase',marginBottom:'1.5rem'}}>
          <span style={{width:'6px',height:'6px',borderRadius:'50%',background:'#c9a84c',display:'inline-block'}}></span>
          SME Expert Directory
        </div>
        <h1 style={{fontFamily:'Playfair Display,serif',fontSize:'clamp(2.2rem,4.5vw,3.8rem)',fontWeight:'700',lineHeight:'1.18',maxWidth:'680px',letterSpacing:'-.02em',color:'#0f1117'}}>
          Connect with <em style={{fontStyle:'italic',color:'#1a56db'}}>verified experts</em> across industries
        </h1>
        <p style={{maxWidth:'520px',fontSize:'1.02rem',color:'#3d4455',margin:'1.3rem auto 2.2rem',fontWeight:'300'}}>
          "We didn't build BRIVOX to teach children how to pass. We built it so they know how to live."

     — Priyanka Edupuganti, Founder, BRIVOX
        </p>

        {/* Search bar */}
        <div style={{display:'flex',alignItems:'center',background:'#fff',border:'1.5px solid #e2e6ef',borderRadius:'50px',padding:'.48rem .48rem .48rem 1.3rem',boxShadow:'0 4px 24px rgba(15,17,23,.07)',width:'100%',maxWidth:'540px',gap:'.5rem'}}>
          <svg width="15" height="15" fill="none" stroke="#8891a8" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input className="search-input" placeholder="Search by name, role, location or expertise…" value={search} onChange={e=>setSearch(e.target.value)} />
          {search && (
            <button onClick={()=>setSearch('')} style={{background:'none',border:'none',color:'#8891a8',cursor:'pointer',fontSize:'1rem',padding:'0 4px'}}>✕</button>
          )}
          <button onClick={()=>fetchSMEs(sector,search)} style={{background:'#0f1117',color:'#fff',border:'none',borderRadius:'40px',padding:'.56rem 1.3rem',fontFamily:'inherit',fontSize:'.86rem',fontWeight:'600',cursor:'pointer'}}>Search</button>
        </div>

        {/* Stats */}
        <div style={{display:'flex',gap:'2.8rem',justifyContent:'center',flexWrap:'wrap',marginTop:'3rem'}}>
          {[['70','Experts Listed'],['20+','Cities'],['7','Sectors'],['100%','Verified']].map(([v,l])=>(
            <div key={l} style={{textAlign:'center'}}>
              <strong style={{fontFamily:'Playfair Display,serif',fontSize:'1.9rem',fontWeight:'700',color:'#0f1117',display:'block'}}>{v}</strong>
              <small style={{fontSize:'.75rem',color:'#8891a8',letterSpacing:'.05em',textTransform:'uppercase'}}>{l}</small>
            </div>
          ))}
        </div>
      </section>

      {/* TOOLBAR */}
      <div style={{padding:'1.2rem 5vw',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'.8rem',borderBottom:'1px solid #e2e6ef',background:'#fafbfd'}}>
        <div style={{display:'flex',alignItems:'center',gap:'.5rem',flexWrap:'wrap'}}>
          <span style={{fontSize:'.75rem',color:'#8891a8',fontWeight:'600',letterSpacing:'.06em',textTransform:'uppercase',marginRight:'.3rem'}}>Sector</span>
          {SECTORS.map(s=>(
            <button key={s} className={`chip${sector===s?' active':''}`} onClick={()=>{setSector(s);setNearMode(false)}}>{s}</button>
          ))}
          <button className="nearest-btn" onClick={findNearest}>📍 Nearest</button>
          {nearMode && <button className="chip" onClick={()=>{setNearMode(false);fetchSMEs()}}>✕ Clear</button>}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'.8rem'}}>
          <select className="sort-select" value={sortBy} onChange={e=>setSortBy(e.target.value)}>
            <option value="default">Sort: Default</option>
            <option value="exp">Sort: Most Experienced</option>
            <option value="domain">Sort: Domain Expertise</option>
            <option value="name">Sort: Name A–Z</option>
          </select>
          <span style={{fontSize:'.82rem',color:'#8891a8',fontWeight:'500',whiteSpace:'nowrap'}}>
            {loading ? 'Loading…' : `${nearMode?'Nearest':'Showing'} ${sorted.length===70?'all 70':sorted.length} experts`}
          </span>
        </div>
      </div>

      {error && <div style={{padding:'.8rem 5vw',background:'#fff5f5',color:'#c53030',fontSize:'.85rem',borderBottom:'1px solid #fed7d7'}}>⚠ {error}</div>}

      {/* GRID */}
      <main className="card-grid">
        {loading
          ? [...Array(6)].map((_,i)=>(
            <div key={i} className="skeleton" style={{borderRadius:'14px',height:'260px',animationDelay:`${i*80}ms`}} />
          ))
          : sorted.length===0
            ? <div style={{gridColumn:'1/-1',textAlign:'center',padding:'4rem 1rem',color:'#8891a8'}}>
                <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{marginBottom:'1rem',opacity:.4}}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <p style={{fontSize:'1rem'}}>No experts match your search.</p>
                <button onClick={()=>{setSearch('');setSector('All');fetchSMEs('All','')}} style={{marginTop:'1rem',background:'#0f1117',color:'#fff',border:'none',borderRadius:'8px',padding:'.5rem 1.2rem',cursor:'pointer',fontFamily:'inherit',fontSize:'.85rem'}}>Clear filters</button>
              </div>
            : sorted.map((s,i)=>(
              <div key={s._id} className="card-anim" style={{animationDelay:`${(i%12)*45}ms`}}>
                <SMECard s={s} onView={setSelected} />
              </div>
            ))
        }
      </main>

      {/* Footer */}
      <footer style={{background:'#0f1117',color:'rgba(255,255,255,.45)',padding:'2.2rem 5vw',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:'1rem',fontSize:'.8rem'}}>
        <div style={{fontFamily:'Playfair Display,serif',fontSize:'1.25rem',fontWeight:'700',color:'#fff',display:'flex',alignItems:'center',gap:'6px'}}>
          BRIVOX <span style={{width:'7px',height:'7px',borderRadius:'50%',background:'#c9a84c',display:'inline-block'}}></span>
        </div>
        <span>© 2026 BRIVOX. All rights reserved.</span>
        <span>hello@brivox.com</span>
      </footer>

      {/* Profile Modal */}
      {selected && <ProfileModal sme={selected} onClose={()=>setSelected(null)} />}

      {/* Back to top */}
      {showTop && (
        <button className="back-top" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}>↑</button>
      )}
    </>
  )
}