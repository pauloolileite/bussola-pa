export const COR_PRIMARIA = '#000441'
export const COR_SECUNDARIA = '#a53c00'

export const CORES = {
  primaria: '#000441',
  secundaria: '#a53c00',
  sucesso: '#16a34a',
  perigo: '#dc2626',
  atencao: '#d97706',
  info: '#1d4ed8',
  sucessoBg: '#f0fdf4',
  perigoBg: '#fef2f2',
  atencaoBg: '#fffbeb',
  infoBg: '#eff6ff',
}

export const dialogSx = {
  '& .MuiPickersToolbar-root': { background: COR_PRIMARIA, color: '#fff' },
  '& .MuiPickersToolbar-title': { color: '#fff' },
  '& .MuiTypography-overline': { color: 'rgba(255,255,255,0.7)' },
  '& .MuiPickersToolbar-content .MuiTypography-root': { color: '#fff' },
  '& .MuiClock-pin': { background: COR_SECUNDARIA },
  '& .MuiClockPointer-root': { background: COR_SECUNDARIA },
  '& .MuiClockPointer-thumb': { background: COR_SECUNDARIA, borderColor: COR_SECUNDARIA },
  '& .MuiClockNumber-root.Mui-selected': { background: COR_SECUNDARIA },
  '& .MuiPickersDay-root.Mui-selected': { background: COR_SECUNDARIA },
  '& .MuiPickersYear-yearButton.Mui-selected': { background: COR_SECUNDARIA },
  '& .MuiButton-root': { color: COR_SECUNDARIA, fontWeight: '600' },
}

export const inputSx = {
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    '& fieldset': { borderColor: '#e5e7eb' },
    '&:hover fieldset': { borderColor: '#9ca3af' },
    '&.Mui-focused fieldset': { borderColor: '#60a5fa', borderWidth: '2px' },
  },
  '& .MuiInputLabel-root': { display: 'none' },
  '& .MuiInputBase-input': { padding: '10px 16px', cursor: 'pointer' },
}