// lib/api.ts
const API_URL = 'http://localhost:8000/api';

// Token'ı localStorage'dan alma yardımcı fonksiyonu
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Kimlik Doğrulama İşlemleri
export async function login(tcKimlik: string, password: string) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tc_kimlik: tcKimlik, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Giriş başarısız');
  }

  return response.json();
}

export async function register(tcKimlik: string, name: string, email: string, password: string) {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tc_kimlik: tcKimlik, name, email, password, role: 'candidate' }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Kayıt başarısız');
  }

  return response.json();
}

// İlan İşlemleri
export async function getListings(status?: string) {
  const token = getToken();
  const url = status ? `${API_URL}/listings?status=${status}` : `${API_URL}/listings`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('İlanlar getirilemedi');
  }

  return response.json();
}

export async function getListing(id: string) {
  const token = getToken();
  const response = await fetch(`${API_URL}/listings/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('İlan detayları getirilemedi');
  }

  return response.json();
}

export async function createListing(listingData: any) {
  const token = getToken();
  const response = await fetch(`${API_URL}/listings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(listingData),
  });

  if (!response.ok) {
    throw new Error('İlan oluşturulamadı');
  }

  return response.json();
}

export async function updateListing(id: string, listingData: any) {
  const token = getToken();
  const response = await fetch(`${API_URL}/listings/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(listingData),
  });

  if (!response.ok) {
    throw new Error('İlan güncellenemedi');
  }

  return response.json();
}

export async function deleteListing(id: string) {
  const token = getToken();
  const response = await fetch(`${API_URL}/listings/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('İlan silinemedi');
  }

  return true;
}

// Başvuru İşlemleri
export async function getApplications(status?: string) {
  const token = getToken();
  const url = status ? `${API_URL}/applications?status=${status}` : `${API_URL}/applications`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Başvurular getirilemedi');
  }

  return response.json();
}

export async function getApplication(id: string) {
  const token = getToken();
  const response = await fetch(`${API_URL}/applications/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Başvuru detayları getirilemedi');
  }

  return response.json();
}

export async function createApplication(listingId: number) {
  const token = getToken();
  const response = await fetch(`${API_URL}/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ listing_id: listingId }),
  });

  if (!response.ok) {
    throw new Error('Başvuru oluşturulamadı');
  }

  return response.json();
}

export async function updateApplicationStatus(id: string, status: string) {
  const token = getToken();
  const response = await fetch(`${API_URL}/applications/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error('Başvuru durumu güncellenemedi');
  }

  return response.json();
}

export async function uploadApplicationDocuments(id: string, formData: FormData) {
  const token = getToken();
  const response = await fetch(`${API_URL}/applications/${id}/documents`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Belgeler yüklenemedi');
  }

  return response.json();
}

// Değerlendirme İşlemleri
export async function getEvaluations(isCompleted?: boolean) {
  const token = getToken();
  const url = isCompleted !== undefined 
    ? `${API_URL}/evaluations?is_completed=${isCompleted}` 
    : `${API_URL}/evaluations`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Değerlendirmeler getirilemedi');
  }

  return response.json();
}

export async function getEvaluation(id: string) {
  const token = getToken();
  const response = await fetch(`${API_URL}/evaluations/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Değerlendirme detayları getirilemedi');
  }

  return response.json();
}

export async function createEvaluation(evaluationData: any) {
  const token = getToken();
  const response = await fetch(`${API_URL}/evaluations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(evaluationData),
  });

  if (!response.ok) {
    throw new Error('Değerlendirme oluşturulamadı');
  }

  return response.json();
}

export async function updateEvaluation(id: string, evaluationData: any) {
  const token = getToken();
  const response = await fetch(`${API_URL}/evaluations/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(evaluationData),
  });

  if (!response.ok) {
    throw new Error('Değerlendirme güncellenemedi');
  }

  return response.json();
}

// Jüri İşlemleri
export async function getJuryMembers() {
  const token = getToken();
  const response = await fetch(`${API_URL}/jury/members`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Jüri üyeleri getirilemedi');
  }

  return response.json();
}

export async function assignJury(juryData: any) {
  const token = getToken();
  const response = await fetch(`${API_URL}/jury/assignments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(juryData),
  });

  if (!response.ok) {
    throw new Error('Jüri ataması yapılamadı');
  }

  return response.json();
}

// Kriter İşlemleri
export async function getCriteria(positionType?: string) {
  const token = getToken();
  const url = positionType 
    ? `${API_URL}/criteria?position_type=${positionType}` 
    : `${API_URL}/criteria`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Kriterler getirilemedi');
  }

  return response.json();
}

export async function createCriteria(criteriaData: any) {
  const token = getToken();
  const response = await fetch(`${API_URL}/criteria`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(criteriaData),
  });

  if (!response.ok) {
    throw new Error('Kriter oluşturulamadı');
  }

  return response.json();
}

export async function updateCriteria(id: string, criteriaData: any) {
  const token = getToken();
  const response = await fetch(`${API_URL}/criteria/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(criteriaData),
  });

  if (!response.ok) {
    throw new Error('Kriter güncellenemedi');
  }

  return response.json();
}

export async function deleteCriteria(id: string) {
  const token = getToken();
  const response = await fetch(`${API_URL}/criteria/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Kriter silinemedi');
  }

  return true;
}