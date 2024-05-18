
import { VariantProps, cva } from "class-variance-authority"
import { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"

export const buttonStyles = cva(
    "inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: ["bg-secondary", "hover:bg-secondary-hover"],
                ghost: ["hover:bg-gray-100"],
                none: [""],
                dark: ["bg-secondary-dark", "hover:bg-secondary-dark-hover", "text-secondary"]
            },
            size: {
                icon: ["rounded", "p-2"],
                square: ["rounded-md", "p-2.5", "size-12", "border border-slate-300"],
                default: [
                    "rounded-full",
                    "size-12",
                    "flex",
                    "items-center",
                    "justify-center",
                    "p-2.5",
                ],
            }
        },
        defaultVariants: {
            variant: "default",
            size: "default"
        }
    })

type ButtonProps = VariantProps<typeof buttonStyles> & ComponentProps<"button">

export function Button({ variant, size, className, ...props }: ButtonProps) {
    return <button {...props} className={twMerge(buttonStyles({ variant, size }),
        className)} />
}