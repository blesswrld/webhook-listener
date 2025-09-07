"use client";

import { useState } from "react";
import { Button } from "./button";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
    textToCopy: string;
}

export function CopyButton({ textToCopy }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2000); // Сбрасываем состояние через 2 секунды
    };

    return (
        <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? (
                <Check className="h-4 w-4 text-green-500" />
            ) : (
                <Copy className="h-4 w-4" />
            )}
        </Button>
    );
}
