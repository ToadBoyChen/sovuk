interface Debug_BorderProps {
  children: React.ReactNode;
}

function Debug_Border({ children }: Debug_BorderProps) {
  return (
    <div className="border border-red-500">
      {children}
    </div>
  );
}

export default Debug_Border;
