// src/components/project/TeamSection.tsx
import type { ProjectDataForDetail, RoleInProject } from '../../types';
import { getCloudinaryImageUrl } from '../../lib/cloudinary';
import { formatProjectRole } from '../../lib/utils';
import { UserCircle2 } from 'lucide-react';

interface Props {
  assignments: ProjectDataForDetail['assignments'];
}

export default function TeamSection({ assignments }: Props) {
  if (!assignments || assignments.length === 0) {
    return <p className="text-center">Bu proje için ekip bilgisi bulunmuyor.</p>;
  }

  const groupedAssignments = new Map<RoleInProject, typeof assignments>();
  assignments.forEach(assignment => {
    const roleKey = assignment.role;
    if (!groupedAssignments.has(roleKey)) {
      groupedAssignments.set(roleKey, []);
    }
    groupedAssignments.get(roleKey)!.push(assignment);
  });

  const roleOrder: RoleInProject[] = ['DIRECTOR', 'SCRIPT_WRITER', 'TRANSLATOR', 'VOICE_ACTOR', 'MIX_MASTER', 'MODDER'];
  const sortedGroupedRolesArray = Array.from(groupedAssignments.entries())
      .sort(([roleA], [roleB]) => roleOrder.indexOf(roleA) - roleOrder.indexOf(roleB));
  
  return (
    <div className="space-y-10">
      {sortedGroupedRolesArray.map(([role, assignmentsInRole]) => (
        <div key={role}>
          <h3 className="text-xl font-semibold mb-5 border-b border-prestij-border-secondary pb-2 text-prestij-purple-light">
            {formatProjectRole(role)}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {assignmentsInRole.map((assignment) => {
              const artist = assignment.artist;
              const artistImageUrl = getCloudinaryImageUrl(artist.imagePublicId);
              return (
                <div key={assignment.id} className="group flex flex-col items-center text-center space-y-2">
                  <div className="w-24 h-24 rounded-full border-2 border-prestij-border-primary group-hover:border-prestij-purple transition-colors overflow-hidden flex items-center justify-center bg-prestij-bg-dark-2">
                    {artistImageUrl ? ( <img src={artistImageUrl} alt={`${artist.firstName} ${artist.lastName}`} className="w-full h-full object-cover"/>) 
                                     : ( <UserCircle2 className="w-20 h-20 text-gray-600" /> )}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{`${artist.firstName} ${artist.lastName}`}</p>
                    {/* Karakter bilgisi eklenebilir */}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}