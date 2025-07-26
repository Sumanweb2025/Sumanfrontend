import './Ourproduct.css';

const categories = [
  {
    title: 'SWEETS',
    count: '9 products',
    img: 'https://images.unsplash.com/photo-1582716401301-b2407dc7563d?w=200&h=200&fit=crop&crop=center',
    alt: 'Indian Sweets',
    className: 'sweets',
  },
  {
    title: 'SNACKS',
    count: '15 products',
    img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=200&fit=crop&crop=center',
    alt: 'Indian Snacks',
    className: 'snacks',
  },
  {
    title: 'HEAT & EAT',
    count: '15 products',
    img: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80',

    alt: 'Ready to Eat Food',
    className: 'heat-eat',
    comingSoon: true,
  },
  {
    title: 'GROCERY',
    count: '0 products',
    img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop&crop=center',
    alt: 'Grocery Items',
    className: 'grocery',
    comingSoon: true,
  },
  {
    title: 'NUTRITIONS',
    count: '0 products',
    img: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=200&h=200&fit=crop&crop=center',
    alt: 'Nutrition Products',
    className: 'nutritions',
    comingSoon: true,
  },
];

const FoodCategories = () => {
  return (
    <div className="our-container">
      <h1 className="our-section-title">Our Products Category</h1>
      <div className="our-cards-grid">
        {categories.map((cat, idx) => (
          <div key={idx} className={`our-card our-${cat.className}`}>
            {cat.comingSoon && <div className="our-coming-soon">COMING SOON</div>}
            <div className="our-card-image">
              <img src={cat.img} alt={cat.alt} />
            </div>
            <div className="our-card-title">{cat.title}</div>
            <div className="our-card-count">{cat.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FoodCategories;
