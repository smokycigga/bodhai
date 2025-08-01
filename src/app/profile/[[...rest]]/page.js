import { UserProfile } from '@clerk/nextjs';
import Sidebar from '../../components/sidebar';

export default function Profile() {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <UserProfile 
            routing="hash"
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'bg-card border border-border shadow-xl rounded-3xl',
                headerTitle: 'text-foreground text-2xl font-bold',
                headerSubtitle: 'text-muted-foreground',
                socialButtonsBlockButton: 'bg-secondary border border-border text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 rounded-xl font-medium',
                socialButtonsBlockButtonText: 'text-secondary-foreground font-medium',
                formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl px-6 py-3',
                formFieldInput: 'bg-background border border-input text-foreground placeholder-muted-foreground rounded-xl focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all duration-200 px-4 py-3',
                formFieldLabel: 'text-foreground font-medium text-sm',
                formFieldAction: 'text-primary hover:text-primary/80 font-medium transition-colors duration-200',
                profileSectionTitle: 'text-foreground font-semibold text-lg',
                profileSectionContent: 'text-muted-foreground',
                profileSectionPrimaryButton: 'bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium px-4 py-2 transition-all duration-200',
                badge: 'bg-primary/10 text-primary border border-primary/20 rounded-lg px-3 py-1 text-sm font-medium',
                avatarBox: 'border-2 border-border rounded-full shadow-lg',
                avatarImage: 'rounded-full',
                navbar: 'bg-card/50 backdrop-blur-sm border-b border-border rounded-t-3xl',
                navbarButton: 'text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 rounded-xl px-4 py-2 font-medium',
                navbarButtonActive: 'text-primary bg-primary/10 border border-primary/20 rounded-xl px-4 py-2 font-medium',
                pageScrollBox: 'bg-transparent',
                page: 'bg-transparent p-6',
                formFieldSuccessText: 'text-chart-1 font-medium',
                formFieldErrorText: 'text-destructive font-medium',
                formFieldHintText: 'text-muted-foreground text-sm',
                identityPreviewText: 'text-foreground',
                identityPreviewEditButton: 'text-primary hover:text-primary/80 font-medium transition-colors duration-200',
                otpCodeFieldInput: 'bg-background border border-input text-foreground rounded-xl focus:border-ring text-center font-mono text-lg',
                formResendCodeLink: 'text-primary hover:text-primary/80 font-medium transition-colors duration-200',
                dividerLine: 'bg-border',
                dividerText: 'text-muted-foreground bg-background px-4',
                alertText: 'text-destructive font-medium',
                formFieldInputShowPasswordButton: 'text-muted-foreground hover:text-foreground transition-colors duration-200',
                formFieldInputShowPasswordIcon: 'text-muted-foreground hover:text-foreground',
                modalContent: 'bg-card border border-border rounded-3xl shadow-2xl',
                modalCloseButton: 'text-muted-foreground hover:text-foreground transition-colors duration-200',
                userButtonBox: 'border border-border rounded-full shadow-lg',
                userButtonTrigger: 'rounded-full',
                userPreviewMainIdentifier: 'text-foreground font-semibold',
                userPreviewSecondaryIdentifier: 'text-muted-foreground',
                userButtonPopoverCard: 'bg-card border border-border rounded-2xl shadow-xl',
                userButtonPopoverActionButton: 'text-foreground hover:bg-accent hover:text-accent-foreground transition-all duration-200 rounded-xl',
                userButtonPopoverActionButtonText: 'font-medium',
                userButtonPopoverFooter: 'border-t border-border',
                breadcrumbs: 'text-muted-foreground',
                breadcrumbsItem: 'text-muted-foreground hover:text-foreground transition-colors duration-200',
                breadcrumbsItemDivider: 'text-border',
                breadcrumbsItemCurrent: 'text-primary font-medium'
              },
              layout: {
                socialButtonsPlacement: 'bottom',
                showOptionalFields: true
              },
              variables: {
                colorPrimary: 'hsl(var(--primary))',
                colorBackground: 'hsl(var(--background))',
                colorInputBackground: 'hsl(var(--background))',
                colorInputText: 'hsl(var(--foreground))',
                colorText: 'hsl(var(--foreground))',
                colorTextSecondary: 'hsl(var(--muted-foreground))',
                colorSuccess: 'hsl(var(--chart-1))',
                colorDanger: 'hsl(var(--destructive))',
                colorWarning: 'hsl(var(--chart-2))',
                colorNeutral: 'hsl(var(--muted))',
                fontFamily: 'var(--font-sans)',
                borderRadius: 'var(--radius)',
                spacingUnit: '1rem'
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}