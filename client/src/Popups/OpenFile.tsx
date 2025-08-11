import { FC, useEffect, useState } from 'react'
import { Popup } from '../Navigation'
import { Entries } from '../utils/Entries'
import { getApiBase } from '../utils/Api'

interface DirEntry {
  name: string
  path: string
  type: 'dir' | 'file'
}

const OpenFilePopup: FC<{
  open: boolean
  handleClose: () => void
  project: string
  onOpenFile: (relativePath: string) => void
  initialDir?: string
}> = ({ open, handleClose, project, onOpenFile, initialDir = '' }) => {
  const [dir, setDir] = useState<string>('')
  const [entries, setEntries] = useState<DirEntry[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !project) return
    // when opening the dialog, start at project root
    setDir(initialDir)
  }, [open, project, initialDir])

  useEffect(() => {
    if (!open || project === undefined || project === null) return
    fetch(`${getApiBase()}/api/list?project=${encodeURIComponent(project)}&dir=${encodeURIComponent(dir)}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(data => { setEntries(data.entries); setError(null) })
      .catch(err => setError(String(err)))
  }, [open, project, dir])

  const goUp = () => {
    if (!dir) return
    const parts = dir.split('/')
    parts.pop()
    setDir(parts.join('/'))
  }

  return (
    <Popup open={open} handleClose={handleClose}>
      <h2>Open file</h2>
      <p>
        <b>Project:</b> {project} &nbsp; <b>Folder:</b> /{dir}
      </p>
      {error && <p style={{ color: 'var(--vscode-errorForeground)' }}>{error}</p>}
      <div style={{ maxHeight: '50vh', overflow: 'auto', border: '1px solid var(--vscode-menu-separatorBackground)' }}>
        <table style={{ width: '100%' }}>
          <tbody>
            <tr>
              <td colSpan={2}>
                <a className="nav-link" onClick={goUp}>&larr; Up</a>
              </td>
            </tr>
            {entries.map(e => (
              <tr key={e.path}>
                <td style={{ width: '4rem' }}>{e.type === 'dir' ? '📁' : '📄'}</td>
                <td>
                  {e.type === 'dir' ? (
                    <a className="nav-link" onClick={() => setDir(e.path)}>{e.name}</a>
                  ) : (
                    <a className="nav-link" onClick={() => { onOpenFile(e.path); handleClose() }}>{e.name}</a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Popup>
  )
}

export default OpenFilePopup


