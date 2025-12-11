import React from 'react';
import clsx from 'clsx';

const StepCard = ({ title, description, icon: Icon, selected, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "flex flex-col items-center p-6 border-2 rounded-2xl transition-all duration-200 w-full text-left md:text-center",
                selected
                    ? "border-blue-600 bg-blue-50 shadow-md transform scale-105"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
            )}
        >
            {Icon && <Icon className={clsx("w-12 h-12 mb-4", selected ? "text-blue-600" : "text-gray-400")} />}
            <h3 className={clsx("text-xl font-bold mb-2", selected ? "text-blue-800" : "text-gray-800")}>{title}</h3>
            <p className="text-gray-600">{description}</p>
        </button>
    );
};

export default StepCard;
