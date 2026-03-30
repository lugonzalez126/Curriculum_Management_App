export default function Toggle({ enabled, onChange }) {
    return (
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className="relative w-10 h-[22px] rounded-full transition-colors duration-200 cursor-pointer shrink-0"
        style={{ backgroundColor: enabled ? '#10B981' : '#D6D3D1' }}
      >
        <span
          className="absolute top-[2px] w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform duration-200"
          style={{
            left: '2px',
            transform: enabled ? 'translateX(18px)' : 'translateX(0)',
          }}
        />
      </button>
    )
  }