# NationNineRealty CP Firm Website

A modern real estate website built with Django REST Framework (backend) and React (frontend), inspired by solerealty.in.

## Features

- **Property Listings**: Browse residential and commercial properties with advanced filtering
- **Property Search**: Search properties by type, location, transaction type, and status
- **Project Details**: Detailed view of each property with images and information
- **Client Showcase**: Display client logos and information
- **Customer Reviews**: Testimonials from satisfied customers
- **Blog**: Real estate blog with articles and posts
- **Gallery**: Image gallery showcasing properties
- **Contact Form**: Contact form for inquiries
- **Statistics**: Display key statistics and achievements
- **Responsive Design**: Fully responsive design for all devices

## Tech Stack

### Backend
- Django 4.2.7
- Django REST Framework 3.14.0
- Django CORS Headers 4.3.1
- Pillow 10.1.0 (for image handling)

### Frontend
- React 18.2.0
- React Router DOM 6.20.0
- Axios 1.6.2
- Vite 5.0.8 (build tool)

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
   - On Windows:
   ```bash
   venv\Scripts\activate
   ```
   - On macOS/Linux:
   ```bash
   source venv/bin/activate
   ```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Run migrations:
```bash
python manage.py migrate
```

6. Create a superuser:
```bash
python manage.py createsuperuser
```

7. Run the development server:
```bash
python manage.py runserver
```

The backend API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000` (or the port Vite assigns)

## Project Structure

```
NationNineRealty/
├── backend/
│   ├── api/
│   │   ├── models.py          # Database models
│   │   ├── serializers.py     # DRF serializers
│   │   ├── views.py           # API views
│   │   ├── urls.py            # API URLs
│   │   └── admin.py           # Django admin configuration
│   ├── nationnine/
│   │   ├── settings.py        # Django settings
│   │   └── urls.py            # Main URLs
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── pages/             # Page components
│   │   ├── components/        # Reusable components
│   │   ├── services/          # API service functions
│   │   └── App.jsx            # Main app component
│   └── package.json
└── README.md
```

## API Endpoints

- `/api/projects/` - List and create projects
- `/api/projects/{id}/` - Get project details
- `/api/services/` - List services
- `/api/clients/` - List clients
- `/api/reviews/` - List reviews
- `/api/reviews/featured/` - Get featured reviews
- `/api/blog/` - List blog posts
- `/api/blog/{slug}/` - Get blog post by slug
- `/api/gallery/` - List gallery images
- `/api/contact/` - Create contact inquiry
- `/api/statistics/` - List statistics
- `/api/achievements/` - List achievements

## Admin Panel

Access the Django admin panel at `http://localhost:8000/admin/` to manage:
- Projects
- Services
- Clients
- Reviews
- Blog Posts
- Gallery Images
- Contact Inquiries
- Statistics
- Achievements

## Adding Content

### Adding Projects
1. Go to Django admin panel
2. Navigate to Projects
3. Click "Add Project"
4. Fill in the details:
   - Title
   - Property Type (Residential/Commercial)
   - Transaction Type (Sell/Buy/Rent)
   - Status (Ongoing/Completed)
   - Location, City, State
   - Description
   - Cover Image
   - Price (optional)
   - Featured (checkbox)

### Adding Blog Posts
1. Go to Django admin panel
2. Navigate to Blog Posts
3. Click "Add Blog Post"
4. Fill in the details:
   - Title (slug will be auto-generated)
   - Excerpt
   - Content
   - Featured Image (optional)
   - Author
   - Category
   - Published (checkbox)

## Environment Variables

For production, create a `.env` file in the backend directory:

```
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-domain.com
```

## Production Deployment

### Backend
1. Set `DEBUG = False` in settings.py
2. Configure proper database (PostgreSQL recommended)
3. Set up static files serving
4. Configure CORS for your domain
5. Use a production WSGI server (Gunicorn)

### Frontend
1. Build the production bundle:
```bash
npm run build
```
2. Serve the `dist` folder using a web server (Nginx, Apache, etc.)

## License

This project is created for NationNineRealty CP Firm.

## Support

For issues or questions, please contact the development team.

