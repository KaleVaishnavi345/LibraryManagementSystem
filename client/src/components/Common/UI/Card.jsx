import React from "react";
import "./Card.css";

function Card({
  children,
  padding = "md", // "sm" | "md" | "lg" | "none"
  hoverable = false,
  className = "",
  onClick,
  ...rest
}) {
  const paddingClass = padding !== "none" ? `ui-card-padding-${padding}` : "";

  return (
    <div
      className={`ui-card ${paddingClass} ${hoverable ? "hoverable" : ""} ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
      {...rest}
    >
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle, action, children, className = "" }) {
  return (
    <div className={`ui-card-header ${className}`}>
      <div>
        {title && <h3 className="ui-card-title">{title}</h3>}
        {subtitle && <p className="ui-card-subtitle">{subtitle}</p>}
        {children}
      </div>
      {action && <div className="ui-card-action">{action}</div>}
    </div>
  );
}

function CardBody({ children, className = "" }) {
  return <div className={`ui-card-body ${className}`}>{children}</div>;
}

function CardFooter({ children, className = "" }) {
  return <div className={`ui-card-footer ${className}`}>{children}</div>;
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
