export default function SMECard({ sme }) {
  const initials = sme.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: sme.color || '#1a56db' }}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate">{sme.name}</p>
            <p className="text-xs text-gray-400 truncate">{sme.role}</p>
            <p className="text-xs text-gray-400">{sme.flag} {sme.location}</p>
          </div>
        </div>
        <div className="flex gap-3 border-y border-gray-50 py-3 mb-3 text-center">
          {[['Exp', sme.profExp + '+'], ['Domain', sme.domainExp + '+'], ['Stage', (sme.stage || '').split(',')[0]]].map(([l, v]) => (
            <div key={l} className="flex-1">
              <p className="font-bold text-gray-800 text-sm">{v}</p>
              <p className="text-xs text-gray-400">{l}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {(sme.services || []).slice(0, 4).map(s => (
            <span key={s} className="bg-blue-50 text-blue-600 rounded-full px-2 py-0.5 text-xs">{s}</span>
          ))}
        </div>
      </div>
      <div className="px-5 py-3 bg-gray-50 flex justify-between items-center">
        <p className="text-xs text-gray-400 truncate max-w-[60%]">{sme.affiliation || '—'}</p>
        <span className="text-xs bg-blue-50 text-blue-600 rounded px-2 py-0.5 font-medium">{(sme.stage || '').split(',')[0]}</span>
      </div>
    </div>
  );
}