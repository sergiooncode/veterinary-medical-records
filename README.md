# Veterinary Medical Records

A system for intelligent processing system for veterinary medical records.

## Architecture

- **Frontend**: ReactJS with TypeScript and Vite for tooling
- **Backend**: FastAPI (Python)
- **Containerization**: Docker Compose for local development

## Assumptions & Design Decisions

- **Monorepo Structure**: Chose monorepo with Docker Compose for convenient local development
- **File Storage**: Local file storage is used for development; in production, S3 or similar would be used. Abstraction added around storage.
- **Text Extraction**: Started with pypdf for PDF and pytesseract/PIL with OCR for images; can be extended with Word document parsing

## Future improvements

- TBA

## Iterative and incremental approach

- Iteration 0 - Frontend skeleton + fake Data and meaningful placeholders

<img src="./resources/iterative_approach/iter0.png" width="600" />

- Iteration 1 – Real File Upload + Basic Preview

<img src="./resources/iterative_approach/iter1_0.png" width="600" />
<br>
<img src="./resources/iterative_approach/iter1_1.png" width="600" />
<br>
<img src="./resources/iterative_approach/iter1_2.png" width="600" />

- Iteration 2 – Extraction Flow (With Mock API First), file can be uploaded but when processed mock data is returned

<img src="./resources/iterative_approach/iter2_0.png" width="600" />
<br>
<img src="./resources/iterative_approach/iter2_1.png" width="600" />
<br>
<img src="./resources/iterative_approach/iter2_2.png" width="600" />
<br>
<img src="./resources/iterative_approach/iter2_3.png" width="600" />
<br>

- Iteration 3 – Wire to Real Backend API to extract text

  - PDF document file type

<img src="./resources/iterative_approach/iter3_0_pdf.png" width="600" />
<br>
<img src="./resources/iterative_approach/iter3_1_pdf.png" width="600" />
<br>

  - PNG document file type

<img src="./resources/iterative_approach/iter3_0_png.png" width="600" />
<br>
<img src="./resources/iterative_approach/iter3_1_png.png" width="600" />
<br>

- Iteration 4 – Wire to Real Backend API to generate structured info

- Iteration 5 – Save extracted text and structured info in DB so a user can continue reviewing a document without processing it again

## Development

### Prerequisites

- Docker and Docker Compose

### Setup

- Frontend

1. Clone the repository
2. Run `make frontend-dev` to start frontend service
3. Access the frontend at http://localhost:3001

- Backend
1. Run `make backend-dev` to start backend service
2. Check is running at http://localhost:8000

- Run tests
  - Backend: `make backend-test`
  - Frontend: `make frontend-test`

- Other tooling
  - Run `make fix` to fix code format using `ruff`
