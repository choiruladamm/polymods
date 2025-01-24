import React from 'react';

interface IDBLayoutProps {
	children: React.ReactNode;
}

const IDBLayout: React.FC<IDBLayoutProps> = ({ children }) => {
	return <React.Fragment>{children}</React.Fragment>;
};

export default IDBLayout;
