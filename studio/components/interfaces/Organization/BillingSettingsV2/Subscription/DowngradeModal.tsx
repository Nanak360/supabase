import InformationBox from 'components/ui/InformationBox'
import { OrgSubscription, ProjectAddon } from 'data/subscriptions/org-subscription-query'
import { PricingInformation } from 'shared-data'
import { Alert, IconAlertOctagon, IconMinusCircle, IconPauseCircle, Modal } from 'ui'

export interface DowngradeModalProps {
  visible: boolean
  selectedPlan?: PricingInformation
  subscription?: OrgSubscription
  onClose: () => void
  onConfirm: () => void
}

const ProjectDowngradeListItem = ({ projectAddon }: { projectAddon: ProjectAddon }) => {
  const needsRestart = projectAddon.addons.find((addon) => addon.type === 'compute_instance')
  const addons = projectAddon.addons.map((addon) => {
    if (addon.type === 'compute_instance') return `${addon.variant.name} Compute Instance`
    return addon.variant.name
  })

  return (
    <li className="list-disc ml-6">
      {projectAddon.name}: {addons.join(', ')} will be removed.
      {needsRestart ? (
        <>
          {' '}
          Project will also <span className="text-amber-900">need to be restarted</span> due to
          change in compute instance
        </>
      ) : (
        ''
      )}
    </li>
  )
}

const DowngradeModal = ({
  visible,
  selectedPlan,
  subscription,
  onClose,
  onConfirm,
}: DowngradeModalProps) => {
  return (
    <Modal
      size="large"
      alignFooter="right"
      visible={visible}
      onCancel={onClose}
      onConfirm={onConfirm}
      header={`Confirm to downgrade to ${selectedPlan?.name} plan`}
    >
      <Modal.Content>
        <div className="py-6">
          <Alert
            withIcon
            variant="warning"
            title="Downgrading to the free plan will lead to reductions in your project's capacity"
          >
            <p>
              If you're already past the limits of the free plan, your project could become
              unresponsive or enter read only mode.
            </p>
          </Alert>

          <ul className="mt-4 space-y-5 text-sm">
            <li className="flex gap-3">
              <div>
                <IconPauseCircle />
              </div>
              <span>Projects will be paused after a week of inactivity</span>
            </li>

            <li>
              <div className="flex gap-3 mb-2">
                <div>
                  <IconMinusCircle />
                </div>
                <span>Add ons from all projects under this organization will be removed.</span>
              </div>
              {(subscription?.project_addons.length ?? 0) > 0 && (
                <InformationBox
                  title={`Warning: A total of ${subscription?.project_addons.length} project(s) will be affected from the downgrade`}
                  description={
                    <ul className="space-y-1 max-h-[100px] overflow-y-auto">
                      {subscription?.project_addons.map((project) => (
                        <ProjectDowngradeListItem key={project.ref} projectAddon={project} />
                      ))}
                    </ul>
                  }
                />
              )}
            </li>

            <li className="flex gap-3">
              <IconAlertOctagon w={14} className="flex-shrink-0" />
              <div>
                <strong>Before you downgrading to the {selectedPlan?.name} plan, consider:</strong>
                <ul className="space-y-2 mt-2">
                  <li className="list-disc ml-4">
                    Your projects no longer require their respective add ons.
                  </li>
                  <li className="list-disc ml-4">
                    Your resource consumption are well within the {selectedPlan?.name} plan's quota.
                  </li>
                  <li className="list-disc ml-4">
                    Alternatively, you may also transfer projects across organizations.
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </div>
      </Modal.Content>
    </Modal>
  )
}

export default DowngradeModal
