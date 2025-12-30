
import React from 'react';

export const Loader: React.FC = React.memo(() => {
    return (
        <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
    );
});