const Card = ({ title, children, className = '', icon: Icon }) => {
  return (
    <div className={`card ${className}`}>
      {(title || Icon) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>}
          {Icon && <Icon className="w-5 h-5 text-gray-500" />}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
