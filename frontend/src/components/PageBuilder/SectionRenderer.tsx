import React from 'react';

interface SectionRendererProps {
  section: any;
  children?: React.ReactNode;
}

const SectionRenderer: React.FC<SectionRendererProps> = ({ section, children }) => {
  const style = {
    padding: section.design?.padding ?? 16,
    margin: section.design?.margin ?? 8,
    fontFamily: section.design?.fontFamily ?? 'Inter',
    fontSize: section.design?.fontSize ?? 18,
    fontWeight: section.design?.fontWeight ?? 400,
    lineHeight: section.design?.lineHeight ?? 1.5,
    boxShadow: section.design?.shadow ? undefined : undefined, // Tailwind shadow handled by className
    border: section.design?.border ? undefined : undefined, // Tailwind border handled by className
    transform: `rotate(${section.design?.rotate ?? 0}deg) scale(${section.design?.scale ?? 1}) skew(${section.design?.skew ?? 0}deg)`
  };
  const classNames = [
    section.design?.shadow ?? '',
    section.design?.border ?? '',
  ].join(' ');
  return (
    <div style={style} className={classNames}>
      {/* Render actual section content here, or children for nested containers */}
      {children}
    </div>
  );
};

export default SectionRenderer;
