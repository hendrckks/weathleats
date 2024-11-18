import { twMerge } from 'tailwind-merge';

interface props {
  children: React.ReactNode;
  className?: string;
}

const Container = ({ children, className }: props) => {
  return (
    <div
      className={twMerge(
        'mx-80 max-w-[1200px]',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Container;
