# Modelleri daha güvenli bir şekilde import edelim
try:
    from app.models.base import Base
    from app.models.user import User, UserRole
    from app.models.listing import Listing, PositionType, ListingStatus
    from app.models.application import Application, ApplicationStatus
    from app.models.evaluation import Evaluation, EvaluationResult
    from app.models.criteria import Criteria
    from app.models.jury_assignment import JuryAssignment
except ImportError as e:
    print(f"Model import hatası: {e}")
