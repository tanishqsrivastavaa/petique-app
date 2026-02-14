import { X } from 'lucide-react'
import { type ReactNode, useEffect } from 'react'

type ModalProps = {
    open: boolean
    onClose: () => void
    title: string
    children: ReactNode
}

const Modal = ({ open, onClose, title, children }: ModalProps) => {
    useEffect(() => {
        if (open) document.body.style.overflow = 'hidden'
        else document.body.style.overflow = ''
        return () => { document.body.style.overflow = '' }
    }, [open])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-white p-6 shadow-card animate-in">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-ink">{title}</h2>
                    <button onClick={onClose} className="btn-icon">
                        <X size={18} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    )
}

export default Modal
