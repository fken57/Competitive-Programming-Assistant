import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NavigationCard.css';

interface NavigationCardProps {
  title: string;
  description: string;
  imageSrc: string;
  linkTo: string;
}

export const NavigationCard: React.FC<NavigationCardProps> = ({
  title,
  description,
  imageSrc,
  linkTo,
}) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(linkTo);
  };

  return (
    <li>
      <a className="card_item" href={linkTo} onClick={handleClick}>
        <article>
          <figure className="card_item_imgWrapper">
            <img src={imageSrc} alt={title} />
          </figure>
          <div className="card_item_body">
            <h3 className="card_item_ttl">{title}</h3>
            <p className="card_item_txt">{description}</p>
          </div>
        </article>
      </a>
    </li>
  );
};

export const NavigationCardList: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="ly_section">
      <div className="ly_section_inner">
        <ul className="card_items">
          {children}
        </ul>
      </div>
    </div>
  );
};
