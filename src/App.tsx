import React from 'react'
import { RouterProvider } from 'react-router-dom'
import { Agentation } from 'agentation'
import { router } from './routes'
import { AuthProvider } from './context/AuthContext'
import { LearningProvider } from './context/LearningContext'
import { ExamSessionProvider } from './context/ExamSessionContext'
import { LanguageProvider } from './context/LanguageContext'
import { ToastProvider } from './components/common/Toast'

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <LearningProvider>
          <ExamSessionProvider>
            <ToastProvider>
              <RouterProvider router={router} />
              {/* Agentation Visual Feedback & Editor Overlay */}
              <Agentation />
            </ToastProvider>
          </ExamSessionProvider>
        </LearningProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
