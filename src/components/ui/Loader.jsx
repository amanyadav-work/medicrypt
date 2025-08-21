import { cn } from '@/lib/utils' // or use 'classnames' / 'clsx'

const Loader = ({
    text,
    color = 'text-green-400',
    fullScreen = false,
    className = '',
    spinnerClassName = '',
}) => {
    return (
        <div
            className={cn(
                'flex text-xs flex-col items-center w-full justify-center h-full',
                fullScreen && 'fixed top-0 inset-0 z-50',
                className
            )}
        >
            <div
                className={cn(
                    'animate-spin !text-green-500 !border-green-500 rounded-full h-4.5 w-4.5 border-b-2',
                    color.replace('text-', 'border-'),
                    spinnerClassName
                )}
            ></div>
            <div className={cn('mt-2', color)}>{text}</div>
        </div>
    )
}

export default Loader;