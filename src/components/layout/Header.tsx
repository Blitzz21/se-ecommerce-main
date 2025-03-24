import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm">
      <button
        onClick={() => navigate('/account')}
        className="text-gray-600 hover:text-gray-900"
      >
        Account
      </button>
    </header>
  );
};

export default Header; 